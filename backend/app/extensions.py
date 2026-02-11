from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from pymongo import MongoClient

db = SQLAlchemy()
migrate = Migrate()

mongo_client = None
mongo_db = None


def init_mongo(app):
    global mongo_client, mongo_db

    mongo_client = MongoClient(app.config["MONGO_URL"])
    mongo_db = mongo_client[app.config["MONGO_DB_NAME"]]
