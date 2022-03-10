from cmath import sqrt
from dataclasses import asdict
import random
from typing import Optional

from bcrypt import hashpw, gensalt, checkpw
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import RedirectResponse
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import MinMaxScaler
import pandas as pd
import datetime
import pandas_datareader.data as web
import numpy as np
from pprint import pprint
from keras.models import load_model
import pickle as pkl

from .db import db, engine
from .model import *
from .schema import *

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

start = datetime(2021, 1, 1)
end = datetime(2021, 12, 1)
models = {}
scalers = {}


async def fetch_user(id: int) -> Optional[User]:
    u = await db.fetch_one(users.select().where(users.c.id == id))
    if u is None:
        return None
    ss = await db.fetch_all(stocks.select().where(stocks.c.user_id == id))
    return User(
        id=u.id,
        username=u.username,
        created=u.created,
        email=u.email,
        watchlist=[
            Stock(
                id=s.id,
                symbol=s.symbol,
                price=s.price,
                last_price=s.last_price,
            )
            for s in ss
        ],
    )


@app.on_event("startup")
async def startup():
    await db.connect()


@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()


@app.get("/")
def main():
    return RedirectResponse(url="/docs/")


@app.get("/users/", response_model=List[User])
async def show_user():
    return await db.fetch_all(users.select())


@app.post("/users/", response_model=User)
async def create_user(u: UserIn):
    user = asdict(u)
    user["created"] = datetime.now()
    user["password"] = hashpw(user["password"].encode("utf-8"), gensalt())
    user["id"] = await db.execute(users.insert().values(**user))
    del user["password"]
    return User(**user)


@app.get("/users/{id}", response_model=User)
async def get_user(id: int):
    u = await fetch_user(id)
    if u is None:
        raise HTTPException(status_code=404, detail="User not found")
    return u


@app.post("/login/", response_model=User)
async def login(u: UserLogin):
    user = await db.fetch_one(users.select().where(users.c.username == u.username))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not checkpw(u.password.encode("utf8"), user.password):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return await fetch_user(user.id)


@app.post("/users/{id}/stock", response_model=User)
async def watch_stock(id: int, s: StockIn):
    stock = asdict(s)
    stock["user_id"] = id
    await db.execute(stocks.insert().values(**stock))
    return await fetch_user(id)


@app.delete("/users/{uid}/stock/{sid}", response_model=User)
async def delete_stock(uid: int, sid: int):
    await db.execute(stocks.delete().where(stocks.c.id == sid))
    return await fetch_user(uid)


@app.post("/prediction", response_model=Prediction)
def prediction(pin: PredictionIn):
    m = None
    if pin.symbol not in models:
        m = load_model(f"./model/{pin.symbol}.h5")
        with open(f"scaler/{pin.symbol}.pkl", "rb") as f:
            scaler = pkl.load(f)
        models[pin.symbol] = m
        scalers[pin.symbol] = scaler
    else:
        m = models[pin.symbol]
        scaler = scalers[pin.symbol]
    X = []
    values = np.array(pin.values)
    values = np.reshape(values, (-1, 1))
    values = scaler.transform(values)
    for i in range(60, 60 + len(values) - 60):
        X.append(np.array(values[i - 60 : i, 0], dtype=np.float64))
    X = np.array(X)
    X = np.reshape(X, (X.shape[0], X.shape[1], 1))
    print(X.shape)

    Y = m.predict(X)
    Y = scaler.inverse_transform(Y)
    Y = np.reshape(Y, (Y.shape[0],)).tolist()

    timestamp = []
    for i in range(30):
        timestamp.append(pin.start + i * 86400)

    return Prediction(timestamp, Y)
