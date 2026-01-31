from werkzeug.security import generate_password_hash
from app.db import SessionLocal
from app.models.user import User

def create_admin_if_not_exists():
    db = SessionLocal()
    try:
        admin = db.query(User).filter_by(username="admin").first()
        if not admin:
            admin = User(
                username="admin",
                password_hash=generate_password_hash("admin123"),
                role="admin"
            )
            db.add(admin)
            db.commit()
            print("✅ Admin created: admin / admin123")
    finally:
        db.close()
