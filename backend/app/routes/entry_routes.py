# backend/app/routes/entry_routes.py

from flask import Blueprint, request, jsonify, g

from app.utils.decorators import token_required
from app.services.entry_service import (
    create_entry,
    get_all_entries,
    update_entry,
    delete_entry
)

entry_bp = Blueprint("entries", __name__)


@entry_bp.route("/", methods=["POST"])
@token_required
def create():
    user = g.current_user
    data = request.get_json()

    response, status = create_entry(user, data)
    return jsonify(response), status


@entry_bp.route("/", methods=["GET"])
@token_required
def get_all():
    response, status = get_all_entries()
    return jsonify(response), status


@entry_bp.route("/<entry_id>", methods=["PATCH"])
@token_required
def update(entry_id):
    user = g.current_user
    data = request.get_json()

    response, status = update_entry(user, entry_id, data)
    return jsonify(response), status


@entry_bp.route("/<entry_id>", methods=["DELETE"])
@token_required
def delete(entry_id):
    user = g.current_user

    response, status = delete_entry(user, entry_id)
    return jsonify(response), status