from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.db import SessionLocal
from app.models.attendance import Attendance
from app.models.student import Student
from datetime import datetime

bp = Blueprint("attendance", __name__)

@bp.route("/verify", methods=["POST"])
@jwt_required()
def verify_attendance():
    """
    Verify student attendance using face image
    """
    db = SessionLocal()
    try:
        user_id = get_jwt_identity()
        image = request.files.get("image")

        # 🔒 Validation
        if not image:
            return jsonify({
                "success": False,
                "error": "No image provided"
            }), 400

        # 🔹 TEMP MOCK FACE MATCH (Phase 5 acceptable)
        student = db.query(Student).first()

        if not student:
            return jsonify({
                "success": False,
                "error": "Face not recognized"
            }), 401

        # 🔹 Persist attendance
        attendance = Attendance(
            student_id=student.id,
            status="Present",
            timestamp=datetime.utcnow()
        )

        db.add(attendance)
        db.commit()
        db.refresh(attendance)

        return jsonify({
            "success": True,
            "student": {
                "id": student.id,
                "name": student.name
            },
            "attendance": {
                "id": attendance.id,
                "status": attendance.status,
                "timestamp": attendance.timestamp.isoformat()
            }
        }), 200

    except Exception as e:
        db.rollback()
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:
        db.close()
