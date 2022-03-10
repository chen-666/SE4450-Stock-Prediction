from dataclasses import field
from typing import List
from datetime import datetime
from pydantic.dataclasses import dataclass
import bcrypt


@dataclass
class Stock:
    id: int
    symbol: str
    price: float
    last_price: float

    class Config:
        orm_mode = True


@dataclass
class StockIn:
    symbol: str
    price: float
    last_price: float


@dataclass
class User:
    id: int
    username: str
    email: str
    created: datetime = field(default_factory=datetime.now)
    watchlist: List[Stock] = field(default_factory=list)

    class Config:
        orm_mode = True


@dataclass
class UserIn:
    username: str
    password: str
    email: str


@dataclass
class UserLogin:
    username: str
    password: str


@dataclass
class Prediction:
    x: List[float]
    y: List[float]


@dataclass
class PredictionIn:
    symbol: str
    start: int
    values: List[float]
