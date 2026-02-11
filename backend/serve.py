from waitress import serve
from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Production server starting on port {port}...")
    print("ℹ️  Ensuring database migrations are applied...")



    # Ensure admin exists
    from app.utils.bootstrap import create_default_admin
    with app.app_context():
        create_default_admin()

    serve(app, host="0.0.0.0", port=port)
