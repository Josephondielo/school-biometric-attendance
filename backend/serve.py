from waitress import serve
from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Production server starting on port {port}...")
    print("ℹ️  Ensuring database migrations are applied...")



    serve(app, host="0.0.0.0", port=port)
