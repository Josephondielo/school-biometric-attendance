from flask import Blueprint, request, jsonify
from app.models.user import User
from app.extensions import db
from flask_jwt_extended import create_access_token, jwt_required
from werkzeug.security import check_password_hash
from app.models.embedding import Embedding
from app.services.face_engine import get_face_encoding
from app.services.matcher import find_best_match
import logging

bp = Blueprint("auth", __name__)
logger = logging.getLogger(__name__)


import traceback

@bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({"error": "Missing JSON body"}), 400

        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            return jsonify({
                "error": "Username and password are required"
            }), 400

        print(f"🔑 Login attempt for: {username}")
        user = User.query.filter_by(username=username).first()

        if not user:
            print(f"❌ User not found: {username}")
            return jsonify({"error": "Invalid credentials"}), 401

        if not check_password_hash(user.password_hash, password):
            print(f"❌ Password mismatch for: {username}")
            return jsonify({"error": "Invalid credentials"}), 401

        access_token = create_access_token(
            identity={
                "id": user.id,
                "role": user.role
            }
        )
        
        print(f"✅ Login successful for: {username}")

        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
        }), 200

    except Exception as e:
        logger.exception("Login failed")
        print(f"❌ Login 500 Error: {e}")
        traceback.print_exc()
        
        # Write to file so Agent can read it
        try:
            with open("backend_errors.log", "a", encoding="utf-8") as f:
                f.write(f"\n--- ERROR AT {traceback.format_exc()} ---\n")
                f.write(str(e))
                f.write("\n")
        except:
            pass

        return jsonify({
            "error": "Internal server error"
        }), 500


@bp.route("/face-login", methods=["POST"])
def face_login():
    """
    Authenticate a user via face recognition.
    """
    image = request.files.get("image")
    if not image:
        return jsonify({"error": "Image required"}), 400

    try:
        # 1. Extract encoding from login attempt
        encoding = get_face_encoding(image)
        if encoding is None:
            return jsonify({"error": "No face detected"}), 400

        # 2. Match against system users only
        user_embeddings = Embedding.query.filter(Embedding.user_id.isnot(None)).all()
        if not user_embeddings:
            return jsonify({"error": "No face IDs registered in system"}), 404

        match = find_best_match(user_embeddings, encoding)
        if not match:
            return jsonify({"error": "Face not recognized"}), 401

        # 3. Successful match
        user = User.query.get(match.user_id)
        if not user:
             return jsonify({"error": "User record missing"}), 500

        # 4. Generate JWT
        access_token = create_access_token(
            identity={
                "id": user.id,
                "role": user.role
            }
        )

        logger.info(f"✅ Face login successful for: {user.username}")

        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
        }), 200

    except Exception as e:
        logger.exception("Face login failed")
        return jsonify({"error": "Internal server error"}), 500


@bp.route("/users", methods=["GET"])
@jwt_required()
def get_users():
    try:
        users = User.query.all()
        return jsonify({
            "users": [{
                "id": u.id,
                "username": u.username,
                "role": u.role
            } for u in users]
        }), 200
    except Exception as e:
        logger.exception("Fetch users failed")
        return jsonify({"error": "Internal server error"}), 500
