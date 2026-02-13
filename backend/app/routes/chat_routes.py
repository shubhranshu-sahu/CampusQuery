from flask import Blueprint, jsonify, g
from datetime import datetime
from bson.objectid import ObjectId

from app.extensions import mongo_db
from app.utils.decorators import token_required

chat_bp = Blueprint("chat", __name__)
