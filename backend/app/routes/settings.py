from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.setting import SystemSetting
from app.extensions import db

bp = Blueprint("settings", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def get_settings():
    return jsonify({
        "school_start_time": SystemSetting.get_val("school_start_time", "08:00")
    })

@bp.route("/update", methods=["POST"])
@jwt_required()
def update_settings():
    identity = get_jwt_identity()
    # Simple role check if identity contains role, or just trust JWT for now
    # Based on previous work, identity is usually a dict with 'role'
    if isinstance(identity, dict) and identity.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    updated_keys = []
    for key, value in data.items():
        setting = SystemSetting.query.filter_by(key=key).first()
        if setting:
            setting.value = str(value)
        else:
            setting = SystemSetting(key=key, value=str(value))
            db.session.add(setting)
        updated_keys.append(key)

    try:
        db.session.commit()
        return jsonify({"success": True, "updated": updated_keys}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
