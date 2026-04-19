from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import (
    db, Company, Job, JobApplication, SavedJob, Review, Notification,
    ExtractedSkill, Resume, User, SkillResource, SkillRoadmap
)
from roadmap import ROADMAP

jobs_bp = Blueprint("jobs", __name__)


# ==================== PUBLIC: DISCOVER COMPANIES & JOBS ====================

@jobs_bp.route("/api/companies", methods=["GET"])
def discover_companies():
    """Public list of companies with their job counts."""
    companies = Company.query.order_by(Company.name).all()
    result = []
    for c in companies:
        avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(company_id=c.id).scalar()
        review_count = Review.query.filter_by(company_id=c.id).count()
        result.append({
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "address": c.address,
            "job_count": Job.query.filter_by(company_id=c.id).count(),
            "avg_rating": round(float(avg_rating), 1) if avg_rating else None,
            "review_count": review_count
        })
    return jsonify(result)


@jobs_bp.route("/api/jobs", methods=["GET"])
def list_all_jobs():
    """Public list of all jobs with optional search/filter."""
    search = request.args.get("search", "").lower()
    skill_filter = request.args.get("skill", "").lower()

    query = Job.query
    if search:
        query = query.filter(
            db.or_(
                Job.role.ilike(f"%{search}%"),
                Job.description.ilike(f"%{search}%")
            )
        )
    if skill_filter:
        query = query.filter(Job.required_skills.ilike(f"%{skill_filter}%"))

    jobs = query.order_by(Job.created_at.desc()).all()
    result = []
    for j in jobs:
        result.append({
            "id": j.id,
            "company_id": j.company_id,
            "company_name": j.company.name,
            "company_email": j.company.email,
            "role": j.role,
            "required_skills": j.required_skills,
            "description": j.description,
            "application_method": j.application_method,
            "created_at": j.created_at.isoformat()
        })
    return jsonify(result)


@jobs_bp.route("/api/jobs/<int:job_id>", methods=["GET"])
def get_job_detail(job_id):
    """Get detailed job info + skill match if user is authenticated."""
    j = Job.query.get_or_404(job_id)
    avg_rating = db.session.query(db.func.avg(Review.rating)).filter_by(company_id=j.company_id).scalar()

    detail = {
        "id": j.id,
        "company_id": j.company_id,
        "company_name": j.company.name,
        "company_email": j.company.email,
        "company_address": j.company.address,
        "role": j.role,
        "required_skills": j.required_skills,
        "description": j.description,
        "application_method": j.application_method,
        "created_at": j.created_at.isoformat(),
        "company_avg_rating": round(float(avg_rating), 1) if avg_rating else None
    }
    return jsonify(detail)


# ==================== SKILL MATCH ====================

@jobs_bp.route("/api/jobs/<int:job_id>/skill-match", methods=["GET"])
@jwt_required()
def skill_match(job_id):
    """Compare user's skills with job requirements."""
    user_id = int(get_jwt_identity())
    job = Job.query.get_or_404(job_id)

    user_skills = set(s.skill_name.lower() for s in ExtractedSkill.query.filter_by(user_id=user_id).all())
    job_skills = set(s.strip().lower() for s in job.required_skills.split(","))

    matched = list(user_skills & job_skills)
    missing = list(job_skills - user_skills)
    score = round((len(matched) / len(job_skills)) * 100, 2) if job_skills else 0

    # Generate learning roadmap for missing skills
    learning = {}
    for skill in missing:
        if skill in ROADMAP:
            learning[skill] = ROADMAP[skill]

    return jsonify({
        "match_score": score,
        "matched_skills": matched,
        "missing_skills": missing,
        "learning_suggestions": learning
    })


# ==================== JOB RECOMMENDATIONS ====================

@jobs_bp.route("/api/recommendations", methods=["GET"])
@jwt_required()
def job_recommendations():
    """Recommend jobs based on user's extracted skills."""
    user_id = int(get_jwt_identity())
    user_skills = set(s.skill_name.lower() for s in ExtractedSkill.query.filter_by(user_id=user_id).all())

    if not user_skills:
        return jsonify([])

    all_jobs = Job.query.all()
    scored = []
    for j in all_jobs:
        job_skills = set(s.strip().lower() for s in j.required_skills.split(","))
        matched = user_skills & job_skills
        missing = job_skills - user_skills
        score = round((len(matched) / len(job_skills)) * 100, 2) if job_skills else 0
        if score > 0:
            scored.append({
                "id": j.id,
                "company_name": j.company.name,
                "role": j.role,
                "match_score": score,
                "matched_skills": list(matched),
                "missing_skills": list(missing),
                "required_skills": j.required_skills,
                "application_method": j.application_method
            })

    scored.sort(key=lambda x: x["match_score"], reverse=True)
    return jsonify(scored[:10])


# ==================== APPLICATIONS ====================

@jobs_bp.route("/api/applications", methods=["GET"])
@jwt_required()
def my_applications():
    user_id = int(get_jwt_identity())
    apps = JobApplication.query.filter_by(user_id=user_id).order_by(JobApplication.applied_at.desc()).all()
    result = []
    for a in apps:
        job = Job.query.get(a.job_id)
        result.append({
            "id": a.id,
            "job_id": a.job_id,
            "job_role": job.role if job else "Unknown",
            "company_name": job.company.name if job else "Unknown",
            "status": a.status,
            "applied_at": a.applied_at.isoformat()
        })
    return jsonify(result)


@jobs_bp.route("/api/applications", methods=["POST"])
@jwt_required()
def apply_for_job():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    job_id = data.get("job_id")

    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    job = Job.query.get_or_404(job_id)

    # Check if already applied
    existing = JobApplication.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        return jsonify({"error": "Already applied for this job"}), 409

    # Get latest resume
    resume = Resume.query.filter_by(user_id=user_id).order_by(Resume.uploaded_at.desc()).first()

    app = JobApplication(user_id=user_id, job_id=job_id, resume_id=resume.id if resume else None)
    db.session.add(app)
    db.session.commit()

    return jsonify({"message": "Application submitted", "id": app.id}), 201


# ==================== SAVED JOBS ====================

@jobs_bp.route("/api/saved-jobs", methods=["GET"])
@jwt_required()
def get_saved_jobs():
    user_id = int(get_jwt_identity())
    saved = SavedJob.query.filter_by(user_id=user_id).order_by(SavedJob.saved_at.desc()).all()
    result = []
    for s in saved:
        job = Job.query.get(s.job_id)
        if job:
            result.append({
                "id": s.id,
                "job_id": job.id,
                "job_role": job.role,
                "company_name": job.company.name,
                "required_skills": job.required_skills,
                "saved_at": s.saved_at.isoformat()
            })
    return jsonify(result)


@jobs_bp.route("/api/saved-jobs", methods=["POST"])
@jwt_required()
def save_job():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    job_id = data.get("job_id")

    if not job_id:
        return jsonify({"error": "job_id is required"}), 400

    Job.query.get_or_404(job_id)

    existing = SavedJob.query.filter_by(user_id=user_id, job_id=job_id).first()
    if existing:
        return jsonify({"error": "Job already saved"}), 409

    saved = SavedJob(user_id=user_id, job_id=job_id)
    db.session.add(saved)
    db.session.commit()
    return jsonify({"message": "Job saved", "id": saved.id}), 201


@jobs_bp.route("/api/saved-jobs/<int:saved_id>", methods=["DELETE"])
@jwt_required()
def unsave_job(saved_id):
    user_id = int(get_jwt_identity())
    saved = SavedJob.query.filter_by(id=saved_id, user_id=user_id).first_or_404()
    db.session.delete(saved)
    db.session.commit()
    return jsonify({"message": "Job removed from saved"})


# ==================== REVIEWS ====================

@jobs_bp.route("/api/companies/<int:company_id>/reviews", methods=["GET"])
def get_reviews(company_id):
    Company.query.get_or_404(company_id)
    reviews = Review.query.filter_by(company_id=company_id).order_by(Review.created_at.desc()).all()
    result = []
    for r in reviews:
        user = User.query.get(r.user_id)
        result.append({
            "id": r.id,
            "user_name": user.name if user else "Anonymous",
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat()
        })
    return jsonify(result)


@jobs_bp.route("/api/companies/<int:company_id>/reviews", methods=["POST"])
@jwt_required()
def create_review(company_id):
    user_id = int(get_jwt_identity())
    Company.query.get_or_404(company_id)
    data = request.get_json()

    rating = data.get("rating")
    comment = data.get("comment", "")

    if not rating or not (1 <= int(rating) <= 5):
        return jsonify({"error": "Rating must be between 1 and 5"}), 400

    review = Review(user_id=user_id, company_id=company_id, rating=int(rating), comment=comment)
    db.session.add(review)
    db.session.commit()
    return jsonify({"message": "Review submitted", "id": review.id}), 201


# ==================== NOTIFICATIONS ====================

@jobs_bp.route("/api/notifications", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = int(get_jwt_identity())
    notifs = Notification.query.filter_by(user_id=user_id).order_by(Notification.created_at.desc()).limit(50).all()
    return jsonify([{
        "id": n.id,
        "message": n.message,
        "is_read": n.is_read,
        "created_at": n.created_at.isoformat()
    } for n in notifs])


@jobs_bp.route("/api/notifications/read-all", methods=["PUT"])
@jwt_required()
def mark_all_read():
    user_id = int(get_jwt_identity())
    Notification.query.filter_by(user_id=user_id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read"})


# ==================== CAREER INSIGHTS ====================

@jobs_bp.route("/api/career-insights", methods=["GET"])
@jwt_required()
def career_insights():
    user_id = int(get_jwt_identity())
    user_skills = [s.skill_name for s in ExtractedSkill.query.filter_by(user_id=user_id).all()]

    if not user_skills:
        return jsonify({
            "top_skills": [],
            "skill_gaps": [],
            "recommended_roles": [],
            "resume_tips": []
        })

    user_skills_lower = set(s.lower() for s in user_skills)

    # Analyze all jobs for skill gaps and role recommendations
    all_jobs = Job.query.all()
    role_scores = []
    all_required_skills = {}

    for j in all_jobs:
        job_skills = set(s.strip().lower() for s in j.required_skills.split(","))
        matched = user_skills_lower & job_skills
        missing = job_skills - user_skills_lower
        score = round((len(matched) / len(job_skills)) * 100, 2) if job_skills else 0

        role_scores.append({"role": j.role, "company": j.company.name, "score": score})

        for skill in job_skills:
            if skill not in all_required_skills:
                all_required_skills[skill] = 0
            all_required_skills[skill] += 1

    role_scores.sort(key=lambda x: x["score"], reverse=True)

    # Find most demanded skills user is missing
    skill_gaps = []
    for skill, count in sorted(all_required_skills.items(), key=lambda x: x[1], reverse=True):
        if skill not in user_skills_lower:
            skill_gaps.append({"skill": skill, "demand_count": count})
    skill_gaps = skill_gaps[:10]

    # Resume improvement tips
    resume_tips = []
    if len(user_skills) < 5:
        resume_tips.append("Add more technical skills to your resume to improve match rates.")
    if not any(s in user_skills_lower for s in ["python", "java", "javascript", "c++", "c"]):
        resume_tips.append("Consider highlighting programming language proficiency.")
    if not any(s in user_skills_lower for s in ["sql", "mysql"]):
        resume_tips.append("Database skills like SQL are highly valued — add them if applicable.")
    if skill_gaps:
        top_gap = skill_gaps[0]["skill"]
        resume_tips.append(f"'{top_gap}' is the most in-demand skill you're missing — consider learning it.")
    resume_tips.append("Use action verbs and quantify achievements in your resume.")
    resume_tips.append("Tailor your resume keywords to match job descriptions.")

    return jsonify({
        "top_skills": user_skills,
        "skill_gaps": skill_gaps,
        "recommended_roles": role_scores[:5],
        "resume_tips": resume_tips
    })


# ==================== LEARNING HUB ====================

@jobs_bp.route("/api/learning-hub", methods=["GET"])
@jwt_required()
def learning_hub():
    """
    Identify user's skill gaps across all jobs and return recommended
    courses/playlists/tutorials from SkillResource table for each missing skill.
    """
    user_id = int(get_jwt_identity())
    user_skills = set(s.skill_name.lower() for s in ExtractedSkill.query.filter_by(user_id=user_id).all())

    if not user_skills:
        return jsonify({
            "user_skills": [],
            "missing_skills": [],
            "skill_resources": {},
            "learning_roadmap": [],
            "summary": {"total_missing": 0, "total_courses": 0, "platforms": []}
        })

    # Collect all required skills across all jobs
    all_jobs = Job.query.all()
    all_required = {}
    for j in all_jobs:
        job_skills = set(s.strip().lower() for s in j.required_skills.split(","))
        for skill in job_skills:
            if skill not in all_required:
                all_required[skill] = {"demand": 0, "roles": []}
            all_required[skill]["demand"] += 1
            if j.role not in all_required[skill]["roles"]:
                all_required[skill]["roles"].append(j.role)

    # Determine missing skills (sorted by demand)
    missing_skills = []
    for skill, info in sorted(all_required.items(), key=lambda x: x[1]["demand"], reverse=True):
        if skill not in user_skills:
            missing_skills.append({
                "skill": skill,
                "demand_count": info["demand"],
                "needed_for_roles": info["roles"][:5]
            })

    # Fetch resources for each missing skill
    skill_resources = {}
    total_courses = 0
    platforms_set = set()
    for gap in missing_skills:
        resources = SkillResource.query.filter(
            db.func.lower(SkillResource.skill_name) == gap["skill"]
        ).all()
        if resources:
            skill_resources[gap["skill"]] = [{
                "id": r.id,
                "course_name": r.course_name,
                "platform": r.platform,
                "course_link": r.course_link,
                "resource_type": r.resource_type,
                "difficulty": r.difficulty,
                "duration": r.duration,
                "thumbnail": r.thumbnail
            } for r in resources]
            total_courses += len(resources)
            for r in resources:
                platforms_set.add(r.platform)

    # Generate AI learning roadmap (ordered path)
    learning_roadmap = []
    for gap in missing_skills:
        roadmap_entry = {
            "skill": gap["skill"],
            "priority": "High" if gap["demand_count"] >= 3 else ("Medium" if gap["demand_count"] >= 2 else "Low"),
            "demand_count": gap["demand_count"],
            "needed_for_roles": gap["needed_for_roles"],
            "steps": []
        }

        # Pull steps from ROADMAP if available
        if gap["skill"] in ROADMAP:
            rm = ROADMAP[gap["skill"]]
            for level in ["Beginner", "Intermediate", "Advanced"]:
                if level in rm:
                    for step in rm[level]:
                        roadmap_entry["steps"].append({"level": level, "topic": step})

        # Add recommended start course
        if gap["skill"] in skill_resources:
            beginner = [r for r in skill_resources[gap["skill"]] if r["difficulty"] == "Beginner"]
            if beginner:
                roadmap_entry["recommended_start"] = beginner[0]

        learning_roadmap.append(roadmap_entry)

    return jsonify({
        "user_skills": list(user_skills),
        "missing_skills": missing_skills,
        "skill_resources": skill_resources,
        "learning_roadmap": learning_roadmap,
        "summary": {
            "total_missing": len(missing_skills),
            "total_courses": total_courses,
            "platforms": list(platforms_set)
        }
    })


@jobs_bp.route("/api/learning-hub/resources", methods=["GET"])
@jwt_required()
def all_resources():
    """Return all available skill resources, optionally filtered by skill or platform."""
    skill = request.args.get("skill", "").lower()
    platform = request.args.get("platform", "")
    difficulty = request.args.get("difficulty", "")

    query = SkillResource.query
    if skill:
        query = query.filter(db.func.lower(SkillResource.skill_name) == skill)
    if platform:
        query = query.filter(SkillResource.platform == platform)
    if difficulty:
        query = query.filter(SkillResource.difficulty == difficulty)

    resources = query.all()
    return jsonify([{
        "id": r.id,
        "skill_name": r.skill_name,
        "course_name": r.course_name,
        "platform": r.platform,
        "course_link": r.course_link,
        "resource_type": r.resource_type,
        "difficulty": r.difficulty,
        "duration": r.duration,
        "thumbnail": r.thumbnail
    } for r in resources])


# ==================== SKILL ROADMAPS ====================

@jobs_bp.route("/api/roadmaps", methods=["GET"])
@jwt_required()
def list_roadmaps():
    """Return all available skill roadmaps (unique skill names with step counts)."""
    skills = db.session.query(
        SkillRoadmap.skill_name,
        db.func.count(SkillRoadmap.id).label("step_count")
    ).group_by(SkillRoadmap.skill_name).order_by(SkillRoadmap.skill_name).all()

    result = []
    for skill_name, step_count in skills:
        result.append({
            "skill_name": skill_name,
            "step_count": step_count,
        })
    return jsonify(result)


@jobs_bp.route("/api/roadmaps/<skill_name>", methods=["GET"])
@jwt_required()
def get_roadmap(skill_name):
    """Return the full step-by-step roadmap for a given skill."""
    steps = SkillRoadmap.query.filter(
        db.func.lower(SkillRoadmap.skill_name) == skill_name.lower()
    ).order_by(SkillRoadmap.step_number).all()

    if not steps:
        return jsonify({"error": "No roadmap found for this skill"}), 404

    return jsonify({
        "skill_name": steps[0].skill_name,
        "total_steps": len(steps),
        "steps": [{
            "id": s.id,
            "step_number": s.step_number,
            "step_title": s.step_title,
            "description": s.description,
            "tools": s.tools.split(",") if s.tools else [],
            "resource_title": s.resource_title,
            "resource_link": s.resource_link,
            "platform": s.platform
        } for s in steps]
    })


@jobs_bp.route("/api/roadmaps/suggested", methods=["GET"])
@jwt_required()
def suggested_roadmaps():
    """Suggest roadmaps based on user's missing skills from resume analysis."""
    user_id = int(get_jwt_identity())
    user_skills = set(s.skill_name.lower() for s in ExtractedSkill.query.filter_by(user_id=user_id).all())

    if not user_skills:
        return jsonify([])

    # Collect all required skills across all jobs
    all_jobs = Job.query.all()
    missing_set = set()
    for j in all_jobs:
        job_skills = set(s.strip().lower() for s in j.required_skills.split(","))
        missing_set.update(job_skills - user_skills)

    # Find roadmaps that match missing skills
    all_roadmap_skills = db.session.query(
        SkillRoadmap.skill_name,
        db.func.count(SkillRoadmap.id).label("step_count")
    ).group_by(SkillRoadmap.skill_name).all()

    suggestions = []
    for skill_name, step_count in all_roadmap_skills:
        if skill_name.lower() in missing_set:
            suggestions.append({
                "skill_name": skill_name,
                "step_count": step_count,
                "reason": "missing_skill"
            })

    return jsonify(suggestions)
