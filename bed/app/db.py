import os
import databases
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import logging

logging.basicConfig(level=logging.DEBUG)
logging.getLogger('sqlalchemy.engine').setLevel(logging.DEBUG)
logging.getLogger('databases').setLevel(logging.DEBUG)


SQLALCHEMY_DATABASE_URI = "sqlite:///{}".format(
    os.path.join(os.path.dirname(__file__), "app.db")
)

engine = create_engine(SQLALCHEMY_DATABASE_URI, echo=True)
Base = declarative_base()
db = databases.Database(SQLALCHEMY_DATABASE_URI)
