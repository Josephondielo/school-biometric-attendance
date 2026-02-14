from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity

from app.extensions import db
from app.models.student import Student
from app.models.embedding import Embedding
from app.services.face_engine import get_face_encoding

bp = Blueprint("faces", __name__)

@bp.route("/register-face", methods=["POST"])
@jwt_required()
def register_face():
    # 🔐 Admin only
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    student_id = request.form.get("student_id")
    image = request.files.get("image")

    if not student_id or not image:
        return jsonify({"error": "student_id and image are required"}), 400

    student = Student.query.get(student_id)
    if not student:
        return jsonify({"error": "Student not found"}), 404

    encoding = get_face_encoding(image)
    if encoding is None:
        return jsonify({"error": "No face detected"}), 400

    # ❌ Prevent duplicate registration
    existing = Embedding.query.filter_by(student_id=student.id).first()
    if existing:
        return jsonify({"error": "Face already registered"}), 409

    embedding = Embedding(
        student_id=student.id,
        vector=encoding.tobytes()
    )

    db.session.add(embedding)
    db.session.commit()

    return jsonify({
        "success": True,
        "student": {
            "id": student.id,
            "name": f"{student.first_name} {student.last_name}"
        }
    }), 201

@bp.route("/register-user-face", methods=["POST"])
@jwt_required()
def register_user_face():
    """
    Enroll a SYSTEM USER (Admin/Staff) with face data.
    Uses the identity from the current JWT token.
    """
    identity = get_jwt_identity()
    user_id = identity # Identity is now the user_id string
    image = request.files.get("image")

    if not image:
        return jsonify({"error": "Image is required"}), 400

    encoding = get_face_encoding(image)
    if encoding is None:
        return jsonify({"error": "No face detected"}), 400

    # ❌ Prevent duplicate registration for this user
    existing = Embedding.query.filter_by(user_id=user_id).first()
    if existing:
        return jsonify({"error": "Face already registered for this user"}), 409

    # 🧬 Save face embedding with user_id
    embedding = Embedding(
        user_id=user_id,
        vector=encoding.tobytes()
    )

    try:
        db.session.add(embedding)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Database error: {str(e)}"}), 500

    return jsonify({
        "success": True,
        "message": "User face registered successfully"
    }), 201
