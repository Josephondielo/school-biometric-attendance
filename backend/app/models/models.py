from app.extensions import db
from datetime import datetime

# Association Table for Many-to-Many between Student and Class
enrollments = db.Table('enrollments',
    db.Column('student_id', db.Integer, db.ForeignKey('students.id'), primary_key=True),
    db.Column('class_id', db.Integer, db.ForeignKey('classes.id'), primary_key=True)
)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def to_dict(self):
        return {"id": self.id, "username": self.username}

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(64), index=True)
    last_name = db.Column(db.String(64), index=True)
    admission_number = db.Column(db.String(20), unique=True, index=True)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    classes = db.relationship('Class', secondary=enrollments, backref=db.backref('students', lazy='dynamic'))
    attendances = db.relationship('Attendance', backref='student', lazy='dynamic')
    embedding = db.relationship('Embedding', backref='student', uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "admission_number": self.admission_number,
            "active": self.is_active,
            "classes": [c.name for c in self.classes]
        }

class Class(db.Model):
    __tablename__ = 'classes'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True)
    description = db.Column(db.String(128))

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description
        }

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20)) # Present, Absent, etc.

    def to_dict(self):
        return {
            "id": self.id,
            "student_id": self.student_id,
            "timestamp": self.timestamp.isoformat(),
            "status": self.status
        }

class Embedding(db.Model):
    __tablename__ = 'embeddings'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'))
    vector = db.Column(db.LargeBinary)
