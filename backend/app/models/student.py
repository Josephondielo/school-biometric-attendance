from sqlalchemy import Column, Integer, String, Boolean
from app.db import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    admission_number = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
