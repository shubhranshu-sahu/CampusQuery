import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")

    ENV = os.getenv("ENV", "development")

    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

    # Database selection logic
    if ENV == "production":
        SQLALCHEMY_DATABASE_URI = os.getenv("PROD_MYSQL_URL")
        MONGO_URL = os.getenv("PROD_MONGO_URL")
    else:
        SQLALCHEMY_DATABASE_URI = os.getenv("MYSQL_URL")
        MONGO_URL = os.getenv("MONGO_URL")

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "campusquery")
