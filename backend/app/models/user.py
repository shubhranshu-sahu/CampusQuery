from app.extensions import db
from .base import BaseModel


class User(BaseModel):
    __tablename__ = "users"

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)

    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    gender = db.Column(db.String(20))
    age = db.Column(db.Integer)

    role = db.Column(db.String(20), nullable=False, default="student")

    entries = db.relationship("Entry", back_populates="creator", cascade="all, delete")

    def __repr__(self):
        return f"<User {self.email}>"
