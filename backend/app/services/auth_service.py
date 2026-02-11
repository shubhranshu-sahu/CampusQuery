from werkzeug.security import generate_password_hash, check_password_hash
from app.extensions import db
from app.models.user import User
from app.utils.jwt_utils import generate_token


def register_user(data):
    # Check if email exists
    existing_user = User.query.filter_by(email=data["email"]).first()
    if existing_user:
        return {"error": "Email already registered"}, 400

    # Hash password
    hashed_password = generate_password_hash(data["password"])

    new_user = User(
        first_name=data["first_name"],
        last_name=data["last_name"],
        email=data["email"],
        password_hash=hashed_password,
        gender=data.get("gender"),
        age=data.get("age"),
        role="student" if data["role"] != "admin" else "admin"
    )

    db.session.add(new_user)
    db.session.commit()

    return {"message": "User registered successfully"}, 201


def login_user(data):
    user = User.query.filter_by(email=data["email"]).first()

    if not user:
        return {"error": "Invalid credentials"}, 401

    if not check_password_hash(user.password_hash, data["password"]):
        return {"error": "Invalid credentials"}, 401

    token = generate_token(user)

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "first_name": user.first_name
        }
    }, 200
