import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")

    # MySQL
    SQLALCHEMY_DATABASE_URI = os.getenv("MYSQL_URL")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # MongoDB
    MONGO_URL = os.getenv("MONGO_URL")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "campusquery")

    # Environment
    ENV = os.getenv("ENV", "development")
