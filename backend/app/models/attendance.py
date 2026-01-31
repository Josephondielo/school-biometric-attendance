from app.extensions import db
from sqlalchemy.sql import func

class Attendance(db.Model):
    __tablename__ = "attendances"

    id = db.Column(db.Integer, primary_key=True, index=True)
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id"),
        nullable=False
    )
    timestamp = db.Column(
        db.DateTime(timezone=True),
        server_default=func.now()
    )
    status = db.Column(db.String(20), nullable=False, default="Present")
