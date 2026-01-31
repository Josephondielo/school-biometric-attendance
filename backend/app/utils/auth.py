from flask import Blueprint, request, jsonify
from app.models.user import User
from app.extensions import db
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash

bp = Blueprint("auth", __name__)

@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data or "username" not in data or "password" not in data:
        return jsonify({"error": "Username and password required"}), 400

    user = db.session.execute(
        db.select(User).filter_by(username=data["username"])
    ).scalar_one_or_none()

    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    if not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(
        identity={"id": user.id, "role": user.role}
    )

    return jsonify({
        "access_token": access_token,
        "role": user.role
    }), 200
