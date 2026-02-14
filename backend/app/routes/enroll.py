from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from app.extensions import db
from app.models.student import Student
from app.models.embedding import Embedding
from app.services.face_engine import get_face_encoding, encoding_to_db
from app.services.matcher import find_best_match

bp = Blueprint("enroll", __name__)


@bp.route("/student", methods=["POST"])
@jwt_required()
def enroll_student():
    """
    Enroll a new student with face data.
    ADMIN ONLY
    """

    # ✅ READ ROLE FROM JWT CLAIMS
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    # 📩 Form data
    first_name = request.form.get("first_name")
    last_name = request.form.get("last_name")
    admission_number = request.form.get("admission_number")
    role = request.form.get("role", "STUDENT").upper()
    image = request.files.get("image")

    current_app.logger.info(f"📝 Enrollment Request: {first_name} {last_name} ({admission_number})")

    if not all([first_name, last_name, admission_number, image]):
        current_app.logger.error("❌ Missing fields in enrollment request")
        return jsonify({
            "error": "first_name, last_name, admission_number and image are required"
        }), 400

    # 🔎 Prevent duplicates
    if Student.query.filter_by(admission_number=admission_number).first():
        current_app.logger.error(f"❌ Duplicate admission number: {admission_number}")
        return jsonify({
            "error": "Student with this admission number already exists"
        }), 409

    # 🧠 Face encoding (High-Fidelity)
    try:
        encoding_result = get_face_encoding(image, is_enrollment=True)
        
        if encoding_result is None:
            current_app.logger.warning("⚠️ No face detected in enrollment image.")
            return jsonify({"error": "No face detected. Use a clear image with one face."}), 400
            
        if isinstance(encoding_result, dict) and "error" in encoding_result:
            current_app.logger.warning(f"⚠️ Quality check failed: {encoding_result['error']}")
            return jsonify(encoding_result), 400
            
        encoding = encoding_result
    except Exception as e:
        current_app.logger.error(f"❌ Error encoding face: {e}")
        return jsonify({"error": "Failed to process face image"}), 500

    # 🛑 Check for duplicate face
    try:
        all_embeddings = Embedding.query.filter(Embedding.student_id.isnot(None)).all()
        # match = find_best_match(all_embeddings, encoding) # Using default tolerance
        # Maybe use stricter tolerance for enrollment to prevent false duplicates? 
        # But we want to prevent enrolling the same person twice.
        match = find_best_match(all_embeddings, encoding, tolerance=0.5) 

        if match:
            existing_student = Student.query.get(match.student_id)
            current_app.logger.error(f"❌ Face already enrolled as: {existing_student.first_name} {existing_student.last_name}")
            return jsonify({
                "error": f"This face is already registered as {existing_student.first_name} {existing_student.last_name} ({existing_student.admission_number})"
            }), 409
            
    except Exception as e:
        current_app.logger.warning(f"⚠️ Warning: Face duplicate check failed: {e}")
        # We might choose to proceed or fail. Failing is safer to maintain integrity.
        return jsonify({"error": f"Duplicate check failed: {str(e)}"}), 500

    try:
        # 👤 Create student
        student = Student(
            first_name=first_name.strip(),
            last_name=last_name.strip(),
            admission_number=admission_number.strip(),
            role=role,
            is_active=True
        )

        db.session.add(student)
        db.session.flush()

        # 🧬 Save face embedding
        embedding = Embedding(
            student_id=student.id,
            vector=encoding_to_db(encoding)
        )

        db.session.add(embedding)
        db.session.commit()
        
        current_app.logger.info(f"✅ Student enrolled: {student.id}")

        return jsonify({
            "success": True,
            "message": "Student enrolled successfully",
            "student": {
                "id": student.id,
                "first_name": student.first_name,
                "last_name": student.last_name,
                "admission_number": student.admission_number,
                "role": student.role
            }
        }), 201

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"❌ Enrollment Database Error: {str(e)}")
        return jsonify({"error": f"Enrollment failed: {str(e)}"}), 500


@bp.route("/students", methods=["GET"])
@jwt_required()
def get_students():
    """
    Get list of all enrolled students
    """
    try:
        students = Student.query.order_by(Student.id.desc()).all()
        
        return jsonify({
            "success": True,
            "students": [{
                "id": s.id,
                "first_name": s.first_name,
                "last_name": s.last_name,
                "admission_number": s.admission_number,
                "role": s.role
            } for s in students]
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"❌ Fetch Error: {str(e)}")
        return jsonify({"error": "Failed to fetch students"}), 500


@bp.route("/student/<int:student_id>", methods=["DELETE"])
@jwt_required()
def delete_student(student_id):
    """
    Delete a student and all associated records (Attendances, Embeddings).
    ADMIN ONLY
    """
    claims = get_jwt()
    if claims.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    try:
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        # 1. Delete associated attendances (if not cascaded by DB)
        from app.models.attendance import Attendance
        Attendance.query.filter_by(student_id=student_id).delete()

        # 2. Delete associated embeddings
        Embedding.query.filter_by(student_id=student_id).delete()

        # 3. Delete student record
        db.session.delete(student)
        db.session.commit()

        current_app.logger.info(f"🗑️ Student deleted (ID: {student_id}) and all records cleared.")
        return jsonify({
            "success": True, 
            "message": f"Student deleted successfully."
        }), 200

    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"❌ Deletion Error: {str(e)}")
        return jsonify({"error": f"Deletion failed: {str(e)}"}), 500
