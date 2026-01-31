from sqlalchemy import Column, Integer, ForeignKey, LargeBinary
from app.db import Base

class Embedding(Base):
    __tablename__ = "embeddings"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    vector = Column(LargeBinary) # Storing numpy array as bytes or specific vector DB logic
