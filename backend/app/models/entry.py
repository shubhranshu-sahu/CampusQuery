from app.extensions import db
from .base import BaseModel


class Entry(BaseModel):
    __tablename__ = "entries"

    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)

    created_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    is_deleted = db.Column(db.Boolean, default=False)

    creator = db.relationship("User", back_populates="entries")

    def __repr__(self):
        return f"<Entry {self.title}>"
