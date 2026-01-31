from app.extensions import db

class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True, index=True)
    first_name = db.Column(db.String(100), nullable=False, index=True)
    last_name = db.Column(db.String(100), nullable=False, index=True)
    admission_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    role = db.Column(db.String(20), nullable=False, default="STUDENT")
    is_active = db.Column(db.Boolean, default=True)
