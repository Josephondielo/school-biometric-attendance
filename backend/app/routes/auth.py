from flask import Blueprint, request, jsonify
from app.extensions import db, jwt
from app.models.models import User
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash, generate_password_hash

bp = Blueprint('auth', __name__)

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400

    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity=user.username)
        return jsonify(access_token=access_token)

    return jsonify({"msg": "Bad username or password"}), 401
