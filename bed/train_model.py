from pathlib import Path
import os

import pandas as pd

#to plot within notebook
import matplotlib.pyplot as plt

from matplotlib.pylab import rcParams
rcParams['figure.figsize'] = 20,10

from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.layers import Dense, Dropout, LSTM
from tensorflow.keras.models import Sequential
import tensorflow.experimental.numpy as tnp
import numpy as np

tnp.experimental_enable_numpy_behavior()


def train_and_save_model(csv_file, outdir):
  save_path = Path(outdir).joinpath(Path(csv_file).name).with_suffix('.h5')
  if save_path.exists():
    print(f"SKIP {save_path}")
    return

  df = pd.read_csv(csv_file)
  df['Date'] = pd.to_datetime(df.Date,format='%Y-%m-%d')
  data = df.sort_index(ascending=True, axis=0)
  new_data = pd.DataFrame(index=range(len(data)-1200,len(data)),columns=['Date', 'Close'])
  for i in range(len(data)-1200,len(data)):
      new_data['Date'][i] = data['Date'][i]
      new_data['Close'][i] = data['Close'][i]

  #setting index
  new_data.index = new_data.Date
  new_data.drop('Date', axis=1, inplace=True)
  dataset = new_data.values

  train = dataset[0:1110,:]
  valid = dataset[len(train):,:]

  #converting dataset into x_train and y_train
  scaler = MinMaxScaler(feature_range=(0, 1))
  scaled_data = scaler.fit_transform(dataset)

  x_train, y_train = [], []
  for i in range(60,len(train)):
      x_train.append(scaled_data[i-60:i,0])
      y_train.append(scaled_data[i,0])
  x_train, y_train = np.array(x_train), np.array(y_train)

  x_train = np.reshape(x_train, (x_train.shape[0],x_train.shape[1],1))

  inputs = new_data[len(new_data) - len(valid) - 60:].values
  inputs = inputs.reshape(-1,1)
  inputs  = scaler.transform(inputs)

  X_test = []
  for i in range(60,inputs.shape[0]):
      X_test.append(inputs[i-60:i,0])
  X_test = np.array(X_test)

  X_test = np.reshape(X_test, (X_test.shape[0],X_test.shape[1],1))
  # create and fit the LSTM network
  model = Sequential()
  model.add(LSTM(units=50, return_sequences=True, input_shape=(x_train.shape[1],1)))
  model.add(LSTM(units=50))
  model.add(Dense(1))

  model.compile(loss='mean_squared_error', optimizer='adam')
  model.fit(x_train, y_train, epochs=1, verbose=0, workers=24)

  closing_price = model.predict(X_test)
  closing_price = scaler.inverse_transform(closing_price)

  rms=np.sqrt(np.mean(np.power((valid-closing_price),2)))
  print(csv_file, rms)

  print(f"save model at {save_path}")
  model.save(save_path)

if __name__ == '__main__':
  print(Path.cwd())
  for f in Path('./bed/hist').iterdir():
    try:
      train_and_save_model(f, "model")
    except:
      print(f"except {f} skip")
