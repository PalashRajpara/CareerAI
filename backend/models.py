from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    resumes = db.relationship("Resume", backref="user", lazy=True, cascade="all, delete-orphan")
    extracted_skills = db.relationship("ExtractedSkill", backref="user", lazy=True, cascade="all, delete-orphan")
    applications = db.relationship("JobApplication", backref="user", lazy=True, cascade="all, delete-orphan")
    saved_jobs = db.relationship("SavedJob", backref="user", lazy=True, cascade="all, delete-orphan")
    notifications = db.relationship("Notification", backref="user", lazy=True, cascade="all, delete-orphan")
    reviews = db.relationship("Review", backref="user", lazy=True, cascade="all, delete-orphan")


class Resume(db.Model):
    __tablename__ = "resumes"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    filename = db.Column(db.String(256), nullable=False)
    filepath = db.Column(db.String(512), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)

    extracted_skills = db.relationship("ExtractedSkill", backref="resume", lazy=True, cascade="all, delete-orphan")


class ExtractedSkill(db.Model):
    __tablename__ = "extracted_skills"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"), nullable=False)
    skill_name = db.Column(db.String(100), nullable=False)


class Company(db.Model):
    __tablename__ = "companies"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(300), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    jobs = db.relationship("Job", backref="company", lazy=True, cascade="all, delete-orphan")
    reviews = db.relationship("Review", backref="company", lazy=True, cascade="all, delete-orphan")


class Job(db.Model):
    __tablename__ = "jobs"
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey("companies.id"), nullable=False)
    role = db.Column(db.String(200), nullable=False)
    required_skills = db.Column(db.Text, nullable=False)  # comma-separated
    description = db.Column(db.Text, nullable=False)
    application_method = db.Column(db.String(50), nullable=False)  # 'platform' or 'email'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    applications = db.relationship("JobApplication", backref="job", lazy=True, cascade="all, delete-orphan")
    saved_by = db.relationship("SavedJob", backref="job", lazy=True, cascade="all, delete-orphan")


class JobApplication(db.Model):
    __tablename__ = "job_applications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    resume_id = db.Column(db.Integer, db.ForeignKey("resumes.id"), nullable=True)
    status = db.Column(db.String(50), default="Applied")  # Applied, Pending, Accepted, Rejected
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)


class SavedJob(db.Model):
    __tablename__ = "saved_jobs"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey("jobs.id"), nullable=False)
    saved_at = db.Column(db.DateTime, default=datetime.utcnow)


class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Review(db.Model):
    __tablename__ = "reviews"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey("companies.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class SkillResource(db.Model):
    __tablename__ = "skill_resources"
    id = db.Column(db.Integer, primary_key=True)
    skill_name = db.Column(db.String(100), nullable=False, index=True)
    course_name = db.Column(db.String(300), nullable=False)
    platform = db.Column(db.String(100), nullable=False)  # e.g. Coursera, Udemy, YouTube
    course_link = db.Column(db.String(500), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)  # course, playlist, tutorial
    difficulty = db.Column(db.String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    duration = db.Column(db.String(100), nullable=True)  # e.g. "4 weeks", "12 hours"
    thumbnail = db.Column(db.String(500), nullable=True)  # Optional thumbnail URL


class SkillRoadmap(db.Model):
    __tablename__ = "skill_roadmaps"
    id = db.Column(db.Integer, primary_key=True)
    skill_name = db.Column(db.String(100), nullable=False, index=True)
    step_number = db.Column(db.Integer, nullable=False)
    step_title = db.Column(db.String(300), nullable=False)
    description = db.Column(db.Text, nullable=True)
    tools = db.Column(db.String(500), nullable=True)  # comma-separated tools/subtopics
    resource_title = db.Column(db.String(300), nullable=True)
    resource_link = db.Column(db.String(500), nullable=True)
    platform = db.Column(db.String(100), nullable=True)
