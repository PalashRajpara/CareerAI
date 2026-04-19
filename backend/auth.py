from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt
)
from models import db, User, Resume, ExtractedSkill
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from skills import SKILLS

bcrypt = Bcrypt()
auth_bp = Blueprint("auth", __name__)

UPLOAD_FOLDER = "uploads"


def extract_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text()
    return text.lower()


def extract_skills_from_text(text):
    return list(set([s for s in SKILLS if s in text]))


# ---------- Register ----------
@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(name=name, email=email, password_hash=pw_hash)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id), additional_claims={"is_admin": user.is_admin})
    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "is_admin": user.is_admin}
    }), 201


# ---------- Login ----------
@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id), additional_claims={"is_admin": user.is_admin})
    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email, "is_admin": user.is_admin}
    })


# ---------- Get Profile ----------
@auth_bp.route("/api/auth/profile", methods=["GET"])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    # Get latest resume and skills
    resume = Resume.query.filter_by(user_id=user_id).order_by(Resume.uploaded_at.desc()).first()
    skills = [s.skill_name for s in ExtractedSkill.query.filter_by(user_id=user_id).all()]

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "is_admin": user.is_admin,
        "skills": skills,
        "resume": {
            "id": resume.id,
            "filename": resume.filename,
            "uploaded_at": resume.uploaded_at.isoformat()
        } if resume else None
    })


# ---------- Update Profile ----------
@auth_bp.route("/api/auth/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    data = request.get_json()

    if "name" in data:
        user.name = data["name"]
    if "email" in data:
        existing = User.query.filter_by(email=data["email"].lower()).first()
        if existing and existing.id != user.id:
            return jsonify({"error": "Email already in use"}), 409
        user.email = data["email"].lower()
    if "password" in data and data["password"]:
        user.password_hash = bcrypt.generate_password_hash(data["password"]).decode("utf-8")

    db.session.commit()
    return jsonify({"message": "Profile updated", "user": {"id": user.id, "name": user.name, "email": user.email}})


# ---------- Upload Resume (Authenticated) ----------
@auth_bp.route("/api/auth/upload-resume", methods=["POST"])
@jwt_required()
def upload_resume_auth():
    user_id = int(get_jwt_identity())
    file = request.files.get("resume")
    if not file:
        return jsonify({"error": "No file provided"}), 400

    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, f"user_{user_id}_{filename}")
    file.save(path)

    # Extract text and skills
    text = extract_text(path)
    skills = extract_skills_from_text(text)

    # Save resume record
    resume = Resume(user_id=user_id, filename=filename, filepath=path)
    db.session.add(resume)
    db.session.flush()

    # Remove old skills for this user, add new
    ExtractedSkill.query.filter_by(user_id=user_id).delete()
    for skill in skills:
        db.session.add(ExtractedSkill(user_id=user_id, resume_id=resume.id, skill_name=skill))

    db.session.commit()

    return jsonify({
        "message": "Resume uploaded successfully",
        "skills": skills,
        "resume": {"id": resume.id, "filename": filename}
    })
