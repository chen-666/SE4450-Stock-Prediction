from pathlib import Path
from black import main
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import pickle as pkl
import multiprocessing as mp

pool = mp.Pool(24)
outdir = Path("scaler").resolve()

def dump_scaler(sym):
    scaler = MinMaxScaler(feature_range=(0, 1))
    df = pd.read_csv(f"hist/{sym}.csv")
    data = df.sort_index(ascending=True, axis=0)
    new_data = pd.DataFrame(
        index=range(len(data) - 1200, len(data)), columns=["Date", "Close"]
    )
    for i in range(len(data) - 1200, len(data)):
        new_data["Date"][i] = data["Date"][i]
        new_data["Close"][i] = data["Close"][i]
    new_data.index = new_data.Date
    new_data.drop("Date", axis=1, inplace=True)
    scaler.fit_transform(new_data.values)

    outpath = outdir.joinpath(f"{sym}.pkl")
    print(f"dump {outpath}")
    with open(outpath, "wb") as outfile:
        pkl.dump(scaler, outfile)
    print(f"dumped {outpath}")

if __name__ == '__main__':
    print(str(outdir))
    xs = []

    for x in Path("model").glob("*.h5"):
        sym = x.stem
        y = pool.apply_async(dump_scaler, [sym])
        xs.append(y)

    for x in xs:
      try:
          x.get(timeout=600)
      except:
        print(f"An error occured")
