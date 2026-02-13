from flask import Flask, app
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate, init_mongo



def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)

    # Initialize SQLAlchemy
    db.init_app(app)

    # Initialize Migrations
    migrate.init_app(app, db)

    # Initialize MongoDB
    init_mongo(app)

    # Import models so Alembic detects them
    from . import models

    # Register blueprints
    from .routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    from .routes.user_routes import user_bp
    app.register_blueprint(user_bp, url_prefix="/api/user")

    from .routes.chat_routes import chat_bp
    app.register_blueprint(chat_bp, url_prefix="/api/chat")


    return app
