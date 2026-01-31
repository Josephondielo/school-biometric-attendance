from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app.db import SessionLocal
from app.models.course import Course

bp = Blueprint("courses", __name__)

# CREATE
@bp.route("/", methods=["POST"])
@jwt_required()
def create_course():
    db = SessionLocal()
    try:
        data = request.get_json()

        if not data or not data.get("name"):
            return jsonify({"error": "Course name is required"}), 400

        if db.query(Course).filter_by(name=data["name"]).first():
            return jsonify({"error": "Course already exists"}), 400

        course = Course(name=data["name"])
        db.add(course)
        db.commit()
        db.refresh(course)

        return jsonify({
            "id": course.id,
            "name": course.name
        }), 201

    finally:
        db.close()

# READ ALL
@bp.route("/", methods=["GET"])
def get_courses():
    db = SessionLocal()
    try:
        courses = db.query(Course).all()
        return jsonify([
            {"id": c.id, "name": c.name} for c in courses
        ])
    finally:
        db.close()

# READ ONE
@bp.route("/<int:id>", methods=["GET"])
def get_course(id):
    db = SessionLocal()
    try:
        course = db.query(Course).get(id)
        if not course:
            return jsonify({"error": "Course not found"}), 404
        return jsonify({"id": course.id, "name": course.name})
    finally:
        db.close()

# UPDATE
@bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def update_course(id):
    db = SessionLocal()
    try:
        course = db.query(Course).get(id)
        if not course:
            return jsonify({"error": "Course not found"}), 404

        data = request.get_json()
        if "name" in data:
            course.name = data["name"]

        db.commit()
        return jsonify({"id": course.id, "name": course.name})
    finally:
        db.close()

# DELETE
@bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_course(id):
    db = SessionLocal()
    try:
        course = db.query(Course).get(id)
        if not course:
            return jsonify({"error": "Course not found"}), 404

        db.delete(course)
        db.commit()
        return jsonify({"message": "Course deleted"})
    finally:
        db.close()
