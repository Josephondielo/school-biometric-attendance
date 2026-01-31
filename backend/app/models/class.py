from sqlalchemy import Column, Integer, String
from app.db import Base

class Class(Base):
    __tablename__ = "classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    # grade_level = Column(String)
