from flask import Flask
from app.extensions import db, migrate, cors, jwt
from app.config import Config

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
    from app.routes.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')

    from app.routes.classes import bp as classes_bp
    app.register_blueprint(classes_bp, url_prefix='/classes')

    from app.routes.enroll import bp as enroll_bp
    app.register_blueprint(enroll_bp, url_prefix='/enroll')
    
    from app.routes.attendance import bp as attendance_bp
    app.register_blueprint(attendance_bp, url_prefix='/attendance')

    @app.route('/')
    def index():
        return {"message": "School Biometrics API (Flask Edition)"}

    return app
