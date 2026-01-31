from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.models import Class
from flask_jwt_extended import jwt_required

bp = Blueprint('classes', __name__)

# CREATE
@bp.route('/', methods=['POST'])
# @jwt_required()
def create_class():
    data = request.get_json()
    if not data or not 'name' in data:
        return jsonify({"error": "Name is required"}), 400
    
    existing = Class.query.filter_by(name=data['name']).first()
    if existing:
        return jsonify({"error": "Class already exists"}), 400

    new_class = Class(name=data['name'], description=data.get('description', ''))
    db.session.add(new_class)
    db.session.commit()
    return jsonify(new_class.to_dict()), 201

# READ ALL
@bp.route('/', methods=['GET'])
def get_classes():
    classes = Class.query.all()
    return jsonify([c.to_dict() for c in classes])

# READ ONE
@bp.route('/<int:id>', methods=['GET'])
def get_class(id):
    cls = Class.query.get_or_404(id)
    return jsonify(cls.to_dict())

# UPDATE
@bp.route('/<int:id>', methods=['PUT'])
# @jwt_required()
def update_class(id):
    cls = Class.query.get_or_404(id)
    data = request.get_json()
    
    if 'name' in data:
        cls.name = data['name']
    if 'description' in data:
        cls.description = data['description']
        
    db.session.commit()
    return jsonify(cls.to_dict())

# DELETE
@bp.route('/<int:id>', methods=['DELETE'])
# @jwt_required()
def delete_class(id):
    cls = Class.query.get_or_404(id)
    db.session.delete(cls)
    db.session.commit()
    return jsonify({"message": "Class deleted"})
