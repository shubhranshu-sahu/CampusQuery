from flask import Flask
from .config import Config
from .extensions import db, migrate, init_mongo


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize SQLAlchemy
    db.init_app(app)

    # Initialize Migrations
    migrate.init_app(app, db)

    # Initialize MongoDB
    init_mongo(app)

    # Import models so Alembic detects them
    from . import models

    # Register blueprints later
    # from .routes.auth_routes import auth_bp
    # app.register_blueprint(auth_bp, url_prefix="/api/auth")

    return app
