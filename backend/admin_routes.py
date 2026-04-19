from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db, Company, Job, JobApplication, User, Review
from functools import wraps

admin_bp = Blueprint("admin", __name__)


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        claims = get_jwt()
        if not claims.get("is_admin", False):
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ==================== COMPANIES ====================

@admin_bp.route("/api/admin/companies", methods=["GET"])
@admin_required
def list_companies():
    companies = Company.query.order_by(Company.created_at.desc()).all()
    result = []
    for c in companies:
        job_count = Job.query.filter_by(company_id=c.id).count()
        avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(company_id=c.id).scalar()
        result.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "address": c.address,
            "job_count": job_count,
            "avg_rating": round(float(avg_rating), 1) if avg_rating else None,
            "created_at": c.created_at.isoformat()
        })
    return jsonify(result)


@admin_bp.route("/api/admin/companies", methods=["POST"])
@admin_required
def create_company():
    data = request.get_json()
    required = ["name", "email", "address"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    company = Company(name=data["name"], email=data["email"], address=data["address"])
    db.session.add(company)
    db.session.commit()
    return jsonify({"message": "Company created", "id": company.id}), 201


@admin_bp.route("/api/admin/companies/<int:company_id>", methods=["GET"])
@admin_required
def get_company(company_id):
    c = Company.query.get_or_404(company_id)
    jobs = [{
        "id": j.id,
        "role": j.role,
        "required_skills": j.required_skills,
        "description": j.description,
        "application_method": j.application_method,
        "created_at": j.created_at.isoformat(),
        "applications_count": JobApplication.query.filter_by(job_id=j.id).count()
    } for j in c.jobs]

    return jsonify({
        "id": c.id,
        "name": c.name,
        "email": c.email,
        "address": c.address,
        "created_at": c.created_at.isoformat(),
        "jobs": jobs
    })


@admin_bp.route("/api/admin/companies/<int:company_id>", methods=["PUT"])
@admin_required
def update_company(company_id):
    c = Company.query.get_or_404(company_id)
    data = request.get_json()
    if "name" in data:
        c.name = data["name"]
    if "email" in data:
        c.email = data["email"]
    if "address" in data:
        c.address = data["address"]
    db.session.commit()
    return jsonify({"message": "Company updated"})


@admin_bp.route("/api/admin/companies/<int:company_id>", methods=["DELETE"])
@admin_required
def delete_company(company_id):
    c = Company.query.get_or_404(company_id)
    db.session.delete(c)
    db.session.commit()
    return jsonify({"message": "Company deleted"})


# ==================== JOBS ====================

@admin_bp.route("/api/admin/jobs", methods=["GET"])
@admin_required
def list_jobs():
    jobs = Job.query.order_by(Job.created_at.desc()).all()
    result = []
    for j in jobs:
        result.append({
            "id": j.id,
            "company_id": j.company_id,
            "company_name": j.company.name,
            "role": j.role,
            "required_skills": j.required_skills,
            "description": j.description,
            "application_method": j.application_method,
            "applications_count": JobApplication.query.filter_by(job_id=j.id).count(),
            "created_at": j.created_at.isoformat()
        })
    return jsonify(result)


@admin_bp.route("/api/admin/jobs", methods=["POST"])
@admin_required
def create_job():
    data = request.get_json()
    required = ["company_id", "role", "required_skills", "description", "application_method"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    # Validate company exists
    Company.query.get_or_404(data["company_id"])

    job = Job(
        company_id=data["company_id"],
        role=data["role"],
        required_skills=data["required_skills"],
        description=data["description"],
        application_method=data["application_method"]
    )
    db.session.add(job)
    db.session.commit()

    # Create notifications for users with matching skills
    _notify_matching_users(job)

    return jsonify({"message": "Job created", "id": job.id}), 201


@admin_bp.route("/api/admin/jobs/<int:job_id>", methods=["PUT"])
@admin_required
def update_job(job_id):
    j = Job.query.get_or_404(job_id)
    data = request.get_json()
    if "role" in data:
        j.role = data["role"]
    if "required_skills" in data:
        j.required_skills = data["required_skills"]
    if "description" in data:
        j.description = data["description"]
    if "application_method" in data:
        j.application_method = data["application_method"]
    if "company_id" in data:
        Company.query.get_or_404(data["company_id"])
        j.company_id = data["company_id"]
    db.session.commit()
    return jsonify({"message": "Job updated"})


@admin_bp.route("/api/admin/jobs/<int:job_id>", methods=["DELETE"])
@admin_required
def delete_job(job_id):
    j = Job.query.get_or_404(job_id)
    db.session.delete(j)
    db.session.commit()
    return jsonify({"message": "Job deleted"})


# ==================== APPLICATIONS (Admin View) ====================

@admin_bp.route("/api/admin/applications", methods=["GET"])
@admin_required
def list_applications():
    apps = JobApplication.query.order_by(JobApplication.applied_at.desc()).all()
    result = []
    for a in apps:
        user = User.query.get(a.user_id)
        job = Job.query.get(a.job_id)
        result.append({
            "id": a.id,
            "user_name": user.name if user else "Unknown",
            "user_email": user.email if user else "",
            "job_role": job.role if job else "Unknown",
            "company_name": job.company.name if job else "Unknown",
            "status": a.status,
            "applied_at": a.applied_at.isoformat()
        })
    return jsonify(result)


@admin_bp.route("/api/admin/applications/<int:app_id>/status", methods=["PUT"])
@admin_required
def update_application_status(app_id):
    app = JobApplication.query.get_or_404(app_id)
    data = request.get_json()
    new_status = data.get("status")
    if new_status not in ["Applied", "Pending", "Accepted", "Rejected"]:
        return jsonify({"error": "Invalid status"}), 400
    app.status = new_status
    db.session.commit()

    # Notify user of status change
    from models import Notification
    notif = Notification(
        user_id=app.user_id,
        message=f"Your application for {app.job.role} at {app.job.company.name} has been updated to: {new_status}"
    )
    db.session.add(notif)
    db.session.commit()

    return jsonify({"message": "Status updated"})


# ==================== STATS ====================

@admin_bp.route("/api/admin/stats", methods=["GET"])
@admin_required
def admin_stats():
    return jsonify({
        "total_companies": Company.query.count(),
        "total_jobs": Job.query.count(),
        "total_users": User.query.filter_by(is_admin=False).count(),
        "total_applications": JobApplication.query.count(),
        "recent_applications": JobApplication.query.order_by(JobApplication.applied_at.desc()).limit(5).count()
    })


# ==================== HELPERS ====================

def _notify_matching_users(job):
    """Notify users whose skills match the new job posting."""
    from models import Notification, ExtractedSkill
    job_skills = set(s.strip().lower() for s in job.required_skills.split(","))
    users = User.query.filter_by(is_admin=False).all()
    for user in users:
        user_skills = set(s.skill_name.lower() for s in ExtractedSkill.query.filter_by(user_id=user.id).all())
        if user_skills & job_skills:  # any overlap
            notif = Notification(
                user_id=user.id,
                message=f"New job matching your skills: {job.role} at {job.company.name}"
            )
            db.session.add(notif)
    db.session.commit()
