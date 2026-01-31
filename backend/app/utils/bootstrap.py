from werkzeug.security import generate_password_hash
from app.models.user import User
from app.extensions import db

def create_default_admin():
    admin = User.query.filter_by(username="admin").first()

    if not admin:
        admin = User(
            username="admin",
            password=generate_password_hash("admin123"),
            role="admin"
        )
        db.session.add(admin)
        db.session.commit()
        print("✅ Default admin created (admin / admin123)")
