from flask import Flask, app
from app.extensions import db, migrate, cors, jwt
from app.config import Config


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, resources={r"/*": {"origins": "*", "allow_headers": ["Content-Type", "Authorization"]}})
    jwt.init_app(app)

    # 🛡️ JWT Error Logging
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"❌ JWT Invalid: {error}")
        return {"error": "Invalid token", "details": error}, 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        print(f"❌ JWT Missing: {error}")
        return {"error": "Request does not contain an access token", "details": error}, 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print(f"❌ JWT Expired: {jwt_payload}")
        return {"error": "Token has expired", "details": "token_expired"}, 401

    # 🔥🔥🔥 FORCE MODEL REGISTRATION 🔥🔥🔥
    with app.app_context():
        from app import models  # noqa: F401

    # CLI
    from app.cli import create_admin
    app.cli.add_command(create_admin)

    # Routes
    from app.routes.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix="/auth")

    from app.routes.courses import bp as courses_bp
    app.register_blueprint(courses_bp, url_prefix="/courses")

    from app.routes.enroll import bp as enroll_bp
    app.register_blueprint(enroll_bp, url_prefix="/enroll")

    from app.routes.attendance import bp as attendance_bp
    app.register_blueprint(attendance_bp, url_prefix="/attendance")

    from app.routes.faces import bp as faces_bp
    app.register_blueprint(faces_bp, url_prefix="/faces")

    from app.routes.settings import bp as settings_bp
    app.register_blueprint(settings_bp, url_prefix="/settings")


    @app.route("/")
    def index():
        return {"message": "School Biometrics API (Flask Edition)"}

    return app
