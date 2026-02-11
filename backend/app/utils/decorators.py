from functools import wraps
from flask import request, jsonify, g
from app.utils.jwt_utils import decode_token
from app.models.user import User


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Token is missing"}), 401

        try:
            token = auth_header.split(" ")[1]
        except IndexError:
            return jsonify({"error": "Invalid token format"}), 401

        payload = decode_token(token)

        if not payload:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = User.query.get(payload["user_id"])
        if not user:
            return jsonify({"error": "User not found"}), 401

        # Store user in Flask global context
        g.current_user = user

        return f(*args, **kwargs)

    return decorated


def role_required(required_role):
    def wrapper(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if g.current_user.role != required_role:
                return jsonify({"error": "Unauthorized access"}), 403
            return f(*args, **kwargs)
        return decorated
    return wrapper
