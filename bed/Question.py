import numpy as np

import pandas as pd
import joblib
import os
import json

from sklearn.model_selection import GridSearchCV

from sklearn.ensemble import RandomForestRegressor

from sklearn.tree import DecisionTreeRegressor
import xgboost as xgb

from sklearn.metrics import mean_squared_error
import warnings
warnings.filterwarnings('ignore')
root = './hist'
save_weight = './model_weight'
save_result = './model_result'
save_print = 'log.txt'

PAST_DAYS = 60
if not os.path.exists(save_weight):
    os.mkdir(save_weight)

if not os.path.exists(save_result):
    os.mkdir(save_result)

def train_model(data, file_name):
    # data['Date'] = pd.to_datetime(data.Date, format='%Y-%m-%d')
    # data = data.sort_index(ascending=True, axis=0)
    data.dropna(axis=0, inplace=True,how='any')
    data = data['Close'].values[-1200:]
    # data = np.reshape(data, (-1,1))

    # Feature Scaling
    # scaler = MinMaxScaler(feature_range=(0, 1))
    # scaled_data = scaler.fit_transform(data)

    x_data, y_data = [], []
    for i in range(PAST_DAYS, len(data)):
        x_data.append(data[i - PAST_DAYS:i])
        y_data.append(data[i])
    x_data, y_data = np.array(x_data), np.array(y_data)

    # x_train, y_train, x_test, y_test = x_data[:1050, :], y_data[:1050, :], x_data[1050:, :], y_data[1050:, :]


    models = [
        ('DecisionTree', DecisionTreeRegressor()),
        # ('SVM', SVR()),
        ('RandomForest', RandomForestRegressor(n_jobs=-1)),
        ('XGB', xgb.XGBRegressor(nthread=-1))
    ]
    param_grids = {
        'DecisionTree': {
            "max_depth": [i*20 for i in range(1, 11)],
            'min_samples_leaf': [2, 3, 5, 10],
            'min_impurity_decrease': [0.1, 0.2, 0.5],
            "max_features": ["auto", "sqrt", "log2"]
        },
        'SVM': {
            "kernel": ['poly', 'rbf'],
            'C': [0.1, 1, 10, 50, 100],
            # 'degree': [i for i in range(1, 3)],
            # 'gamma': ['scale', 'auto'],
        },
        'RandomForest': {
            "n_estimators": [5,10,15,20],
            "min_samples_split": [3,6,9],
        },
        'XGB':{
            "learning_rate": [ 0.05, 0.1, 0.5,],
            "n_estimators": [5,10,15,20],
            "max_depth": [6, 10, 20],

            # 'min_child_weight': [4, 5],
            # 'gamma': [i / 10.0 for i in range(3, 6)],
            # 'subsample': [i / 10.0 for i in range(6, 11)],
            # 'colsample_bytree': [i / 10.0 for i in range(6, 11)],
        }
    }
    best_model_name, best_model, best_mae, best_mse, best_rmse = None, None, None, None, None
    result_score = {}
    for idx, (name, model) in enumerate(models):
        param_grid = param_grids[name]
        grid_search_cv = GridSearchCV(estimator=model, scoring='neg_mean_absolute_error', param_grid=param_grid, cv=3)
        grid_search_cv.fit(x_data, y_data)
        mae = np.abs(grid_search_cv.best_score_)

        grid_search_cv = GridSearchCV(estimator=model, scoring='neg_mean_squared_error', param_grid=param_grid, cv=3)
        grid_search_cv.fit(x_data, y_data)
        mse = np.abs(grid_search_cv.best_score_)
        rmse = np.sqrt(mse)

        if best_model is None:
            best_model = grid_search_cv.best_estimator_
            best_mse = mse

        elif best_mse > mse:
            best_model = grid_search_cv.best_estimator_
            best_mse = mse

        result_score[name] = {
            "best params": grid_search_cv.best_params_,
            "mae": mae,
            "mse": mse,
            "rmse": rmse,
        }
        print("model name: {}".format(name))
        print("best params: {}".format(grid_search_cv.best_params_))
        print("mae: {}".format(mae))
        print("mse: {}".format(mse))
        print("rmse: {}".format(rmse))
        with open(save_print, "a+") as f_print:
            f_print.writelines("model name: {}\n".format(name))
            f_print.writelines("best params: {}\n".format(grid_search_cv.best_params_))
            f_print.writelines("mae: {}\n".format(mae))
            f_print.writelines("mse: {}\n".format(mse))
            f_print.writelines("rmse: {}\n".format(rmse))
    with open(save_print, "a+") as f_print:
        f_print.writelines('*****************************finish!********************************\n')

    print('*****************************finish!********************************')

    best_model = best_model.fit(x_data, y_data)
    # save model to file
    joblib.dump(best_model, os.path.join(save_weight, file_name+".pkl"))
    # save result to file
    print(result_score)
    with open(os.path.join(save_result, file_name + ".json"), "w+") as f:
        json.dump(result_score, f)

    # load_model = joblib.load(os.path.join(save_weight, file_name+".pkl"))
    # pre = load_model.predict(x_data)
    # print(pre)
    # print("测试：", mean_squared_error(y_data, pre))

def test_model(x_test, file_name):
    load_model = joblib.load(os.path.join(save_weight, file_name+".pkl"))
    pre = load_model.predict(x_test)
    return pre



def read_data(path):
    try:
        data = pd.read_csv(path)
    except :
        return None
    if data.shape[0] < 1200:
        return None
    return data

def train():
    import time
    for file in os.listdir(root):
        file_name = file.split('.')[0] # Company name
        if os.path.exists(os.path.join(save_weight, file_name + ".pkl")):
            print(f'the file {file_name} already exists')
            continue
        path = os.path.join(root, file)
        data = read_data(path)
        if data is None: continue
        train_model(data, file_name)

def test():
    for file in os.listdir(root):
        file_name = file.split('.')[0] # Company name
        if not os.path.exists(os.path.join(save_weight, file_name + ".pkl")):
            # print(f'the file {file_name} does not exist')
            continue
        path = os.path.join(root, file)
        data = read_data(path)
        if data is None: continue
        data.dropna(axis=0, inplace=True, how='any')
        data = data['Close'].values[-1200:]
        x_data, y_data = [], []
        for i in range(PAST_DAYS, len(data)):
            x_data.append(data[i - PAST_DAYS:i])
            y_data.append(data[i])
        x_data, y_data = np.array(x_data), np.array(y_data)

        pre = test_model(x_data, file_name)
        print("test score:", mean_squared_error(y_data, pre))


if __name__ == '__main__':
    # train()
    test()