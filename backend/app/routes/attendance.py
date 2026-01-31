from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta, time
from sqlalchemy import cast, Date, Time

from app.extensions import db
from app.models.attendance import Attendance
from app.models.student import Student
from app.models.embedding import Embedding
from app.models.setting import SystemSetting
from app.services.face_engine import get_face_encoding
from app.services.matcher import find_best_match

bp = Blueprint("attendance", __name__)

@bp.route("/verify", methods=["POST"])
def verify_attendance():
    image = request.files.get("image")

    if not image:
        return jsonify({"error": "Image required"}), 400

    # 1. Extract face encoding
    try:
        unknown_encoding = get_face_encoding(image)
        if unknown_encoding is None:
            current_app.logger.warning("⚠️ No face detected in scan.")
            return jsonify({"error": "No face detected"}), 400
    except Exception as e:
        current_app.logger.error(f"❌ Error during face detection: {e}")
        return jsonify({"error": "Face detection failed"}), 500

    # 2. Load embeddings (Students only)
    known_embeddings = Embedding.query.filter(Embedding.student_id.isnot(None)).all()
    if not known_embeddings:
        current_app.logger.warning("⚠️ No students registered in database.")
        return jsonify({"error": "No students registered"}), 400

    # 3. Match
    match = find_best_match(known_embeddings, unknown_encoding)
    if not match:
        return jsonify({"error": "Student not recognized"}), 401

    # 4. Get student
    student = Student.query.get(match.student_id)
    if not student:
        current_app.logger.error(f"❌ Student record missing for id: {match.student_id}")
        return jsonify({"error": "Invalid student record"}), 500

    # 5. Save attendance
    try:
        # Determine status (Late/Present)
        cutoff_str = SystemSetting.get_val('school_start_time', '08:00')
        cutoff_time = datetime.strptime(cutoff_str, "%H:%M").time()
        now_time = datetime.now().time()
        status = "Present" if now_time <= cutoff_time else "Late"

        attendance = Attendance(
            student_id=student.id,
            status=status
        )
        db.session.add(attendance)
        db.session.commit()
        current_app.logger.info(f"✅ Attendance recorded for: {student.first_name} {student.last_name}")
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"❌ Database error: {e}")
        return jsonify({"error": "Failed to record attendance"}), 500

    return jsonify({
        "success": True,
        "student": {
            "id": student.id,
            "name": f"{student.first_name} {student.last_name}",
            "admission_number": student.admission_number
        },
        "attendance": {
            "id": attendance.id,
            "status": attendance.status,
            "timestamp": attendance.timestamp.isoformat()
        }
    }), 200


@bp.route("/stats", methods=["GET"])
def get_stats():
    try:
        today = datetime.now().date()
        
        # 1. Total Students
        total_students = Student.query.count()
        
        # 2. Present Today (Unique students)
        present_count = db.session.query(Attendance.student_id)\
            .filter(cast(Attendance.timestamp, Date) == today)\
            .distinct().count()
            
        # 3. Recent Activity (Last 5)
        recent = db.session.query(Attendance, Student)\
            .join(Student, Attendance.student_id == Student.id)\
            .order_by(Attendance.timestamp.desc())\
            .limit(5).all()
            
        activity_log = []
        for att, stu in recent:
            activity_log.append({
                "name": f"{stu.first_name} {stu.last_name}",
                "time": att.timestamp.strftime("%I:%M %p"),
                "status": "Check In" if att.status == "Present" else att.status,
                "color": "text-success"
            })

        percentage = int((present_count / total_students * 100)) if total_students > 0 else 0

        return jsonify({
            "total_students": total_students,
            "present_today": present_count,
            "percentage": percentage,
            "recent_activity": activity_log
        }), 200

    except Exception as e:
        current_app.logger.error(f"Stats Error: {e}")
        return jsonify({"error": "Failed to fetch stats"}), 500


@bp.route("/report", methods=["GET"])
def get_report():
    try:
        range_param = request.args.get("range", "7d")
        student_id_param = request.args.get("student_id")
        
        days_map = {"7d": 7, "30d": 30, "90d": 90}
        days_to_check = days_map.get(range_param, 7)
        
        today = datetime.now().date()
        
        # 1. Weekly/Monthly Trend
        trend_data = []
        total_attendance_period = 0
        days_with_data = 0
        
        # Determine step for larger ranges to avoid too many points? 
        # For 90d, maybe daily is fine (90 points), let's keep it daily for simplicity and detail.
        
        for i in range(days_to_check - 1, -1, -1):
            date_check = today - timedelta(days=i)
            # Label format changes based on range? 
            # For 7d: Mon, Tue... 
            # For 30d/90d: 01/25
            day_label = date_check.strftime("%a") if days_to_check <= 7 else date_check.strftime("%m/%d")
            
            query = db.session.query(Attendance.student_id).filter(cast(Attendance.timestamp, Date) == date_check)
            
            if student_id_param:
                query = query.filter(Attendance.student_id == student_id_param)
                total_students = 1
            else:
                total_students = Student.query.count()

            present_count = query.distinct().count()
            
            percentage = int((present_count / total_students * 100)) if total_students > 0 else 0
            
            trend_data.append({"day": day_label, "attendance": percentage})
            
            # Only count stats for valid days if we want true average
            # Or simplistic average over the period
            if percentage > 0:
                total_attendance_period += percentage
                days_with_data += 1

        # 2. Stats
        avg_attendance = round(total_attendance_period / days_with_data, 1) if days_with_data > 0 else 0
        
        # Total present query (for the period or today? Report implies period usually, but dashboard showed today)
        # Let's show Total Present counts for the PERIOD sum if range > 7, or keep today?
        # User wants "last 30 days" report. "Total Present" usually means unique counts or sum of attendances.
        # Let's return Total Attendance Events in this period.
        total_present_query = db.session.query(Attendance).filter(cast(Attendance.timestamp, Date) >= (today - timedelta(days=days_to_check)))
        if student_id_param:
            total_present_query = total_present_query.filter(Attendance.student_id == student_id_param)
            
        total_present_count = total_present_query.count()
            
        # 3. Punctuality (Students arriving before threshold in this period)
        start_time_str = SystemSetting.get_val('school_start_time', '08:00')
        cutoff_time = datetime.strptime(start_time_str, "%H:%M").time()
        
        on_time_query = total_present_query.filter(cast(Attendance.timestamp, Time) <= cutoff_time)
        on_time_count = on_time_query.count()
            
        punctuality_rate = int((on_time_count / total_present_count * 100)) if total_present_count > 0 else 100

        # 4. Recent Logs (New)
        # Reuse the filter logic from total_present_query
        recent_logs_query = db.session.query(Attendance, Student)\
            .join(Student, Attendance.student_id == Student.id)\
            .filter(cast(Attendance.timestamp, Date) >= (today - timedelta(days=days_to_check)))
        
        if student_id_param:
            recent_logs_query = recent_logs_query.filter(Attendance.student_id == student_id_param)
            
        recent_records = recent_logs_query.order_by(Attendance.timestamp.desc()).limit(50).all()
        
        recent_logs = []
        for att, stu in recent_records:
            recent_logs.append({
                "id": att.id,
                "name": f"{stu.first_name} {stu.last_name}",
                "admission_number": stu.admission_number,
                "date": att.timestamp.strftime("%Y-%m-%d"),
                "time": att.timestamp.strftime("%I:%M %p"),
                "status": att.status
            })

        return jsonify({
            "weekly_trend": trend_data,
            "avg_attendance": avg_attendance,
            "total_present": total_present_count,
            "punctuality": punctuality_rate,
            "recent_logs": recent_logs
        }), 200

    except Exception as e:
        current_app.logger.error(f"Report Error: {e}")
        return jsonify({"error": "Failed to fetch report"}), 500


@bp.route("/export", methods=["GET"])
def export_attendance():
    try:
        range_param = request.args.get("range", "30d")
        student_id_param = request.args.get("student_id")
        
        days_map = {"7d": 7, "30d": 30, "90d": 90, "all": 3650}
        days_to_check = days_map.get(range_param, 30)
        
        today = datetime.now().date()
        start_date = today - timedelta(days=days_to_check)
        
        query = db.session.query(Attendance, Student)\
            .join(Student, Attendance.student_id == Student.id)\
            .filter(cast(Attendance.timestamp, Date) >= start_date)\
            .order_by(Attendance.timestamp.desc())
            
        if student_id_param:
            query = query.filter(Attendance.student_id == student_id_param)
            
        records = query.all()
        
        export_data = []
        for att, stu in records:
            export_data.append({
                "Date": att.timestamp.strftime("%Y-%m-%d"),
                "Time": att.timestamp.strftime("%I:%M %p"),
                "Student Name": f"{stu.first_name} {stu.last_name}",
                "Admission No": stu.admission_number,
                "Status": att.status
            })
            
        return jsonify(export_data), 200
        
    except Exception as e:
        current_app.logger.error(f"Export Error: {e}")
        return jsonify({"error": "Failed to export data"}), 500
