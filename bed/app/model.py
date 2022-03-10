from sqlalchemy import (
    Column,
    String,
    Integer,
    DateTime,
    ForeignKey,
    Float,
    Date,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql.schema import Table
from .db import Base


class UserOrm(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    password = Column(String(50))
    email = Column(String(50), unique=True, index=True)
    created = Column(DateTime)
    watchlist = relationship("StockOrm")


class StockOrm(Base):
    __tablename__ = "stocks"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), unique=True, index=True)
    price = Column(Float)
    last_price = Column(Float)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("UserOrm", back_populates="watchlist")


users = UserOrm.__table__
stocks = StockOrm.__table__
