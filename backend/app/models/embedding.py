from app.extensions import db

class Embedding(db.Model):
    __tablename__ = "embeddings"

    id = db.Column(db.Integer, primary_key=True, index=True)
    student_id = db.Column(
        db.Integer,
        db.ForeignKey("students.id"),
        nullable=True,
        index=True
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=True,
        index=True
    )
    vector = db.Column(db.LargeBinary, nullable=False)
