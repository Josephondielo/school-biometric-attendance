from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.models import Student

bp = Blueprint('enroll', __name__)

@bp.route('/student', methods=['POST'])
def enroll_student():
    # Placeholder for file handling and face encoding
    return jsonify({"message": "Enrollment placeholder"}), 201
