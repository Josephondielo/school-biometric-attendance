import os

# Manual .env loading
try:
    with open('.env', 'r') as f:
        for line in f:
            if '=' in line and not line.startswith('#'):
                key, value = line.strip().split('=', 1)
                os.environ[key] = value
except FileNotFoundError:
    print(".env not found")

from app import create_app
from app.models.user import User

app = create_app()

with app.app_context():
    users = User.query.all()
    print("Users found:", len(users))
    for u in users:
        print(f"User: {u.username}, Role: {u.role}")
