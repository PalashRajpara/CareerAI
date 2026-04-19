from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
import os, pandas as pd
from datetime import timedelta
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from skills import SKILLS
from roadmap import ROADMAP
from models import db, Company, Job, User, SkillResource, SkillRoadmap

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuration
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///career_platform.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "super-secret-career-platform-key-change-in-production"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Register blueprints
from auth import auth_bp
from admin_routes import admin_bp
from job_routes import jobs_bp

app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(jobs_bp)

# Legacy CSV data for backward compatibility
jobs_csv = pd.read_csv("job_data.csv")


def extract_text(pdf_path):
    reader = PdfReader(pdf_path)
    text = ""
    for page in reader.pages:
        if page.extract_text():
            text += page.extract_text()
    return text.lower()


def extract_skills(text):
    return list(set([s for s in SKILLS if s in text]))


def generate_roadmap(missing):
    roadmap = {}
    for skill in missing:
        if skill in ROADMAP:
            roadmap[skill] = ROADMAP[skill]
    return roadmap


# Legacy upload endpoint (kept for backward compatibility with existing UI)
@app.route("/upload-resume", methods=["POST"])
def upload_resume():
    file = request.files["resume"]
    path = os.path.join(UPLOAD_FOLDER, secure_filename(file.filename))
    file.save(path)

    resume_text = extract_text(path)
    user_skills = extract_skills(resume_text)

    results = []
    for _, row in jobs_csv.iterrows():
        job_skills = row["skills"].split(",")
        matched = set(user_skills).intersection(job_skills)
        missing = list(set(job_skills) - matched)

        match_percent = round((len(matched) / len(job_skills)) * 100, 2)

        results.append({
            "job_role": row["job_role"],
            "match_percentage": match_percent,
            "matched_skills": list(matched),
            "missing_skills": missing,
            "learning_roadmap": generate_roadmap(missing)
        })

    results = sorted(results, key=lambda x: x["match_percentage"], reverse=True)

    return jsonify({
        "status": "success",
        "extracted_skills": user_skills,
        "career_recommendations": results[:3]
    })


def seed_admin():
    """Create a default admin user if none exists."""
    admin = User.query.filter_by(is_admin=True).first()
    if not admin:
        pw_hash = bcrypt.generate_password_hash("admin123").decode("utf-8")
        admin = User(name="Admin", email="admin@career.com", password_hash=pw_hash, is_admin=True)
        db.session.add(admin)
        db.session.commit()
        print("✅ Default admin created: admin@career.com / admin123")


def seed_sample_data():
    """Seed some sample companies and jobs if DB is empty."""
    if Company.query.count() == 0:
        companies_data = [
            {"name": "TechCorp", "email": "hr@techcorp.com", "address": "San Francisco, CA"},
            {"name": "DataWorks", "email": "jobs@dataworks.io", "address": "New York, NY"},
            {"name": "CloudNine Solutions", "email": "careers@cloudnine.dev", "address": "Austin, TX"},
            {"name": "AI Innovations", "email": "talent@aiinnovations.com", "address": "Seattle, WA"},
            {"name": "WebStack Labs", "email": "hr@webstacklabs.com", "address": "Boston, MA"},
        ]
        for cd in companies_data:
            db.session.add(Company(**cd))
        db.session.flush()

        jobs_data = [
            {"company_id": 1, "role": "Python Developer", "required_skills": "python,flask,sql,django", "description": "Build and maintain Python-based web applications and APIs. Work with Flask and Django frameworks.", "application_method": "platform"},
            {"company_id": 1, "role": "Frontend Engineer", "required_skills": "javascript,react,html,css", "description": "Develop responsive and interactive user interfaces using React and modern CSS.", "application_method": "platform"},
            {"company_id": 2, "role": "Data Analyst", "required_skills": "python,sql,data analysis,excel", "description": "Analyze large datasets to derive business insights. Create reports and dashboards.", "application_method": "email"},
            {"company_id": 2, "role": "Machine Learning Engineer", "required_skills": "python,machine learning,sql,data analysis", "description": "Design and deploy machine learning models for production systems.", "application_method": "platform"},
            {"company_id": 3, "role": "Full Stack Developer", "required_skills": "python,javascript,react,sql,html,css", "description": "Work across the full stack building cloud-native applications.", "application_method": "platform"},
            {"company_id": 3, "role": "DevOps Engineer", "required_skills": "python,sql,flask", "description": "Manage CI/CD pipelines and cloud infrastructure. Automate deployment processes.", "application_method": "email"},
            {"company_id": 4, "role": "AI Research Intern", "required_skills": "python,machine learning,data analysis", "description": "Assist in cutting-edge AI research projects. Work with state-of-the-art models.", "application_method": "platform"},
            {"company_id": 5, "role": "Junior Web Developer", "required_skills": "html,css,javascript,react", "description": "Join our web team to build beautiful and performant websites.", "application_method": "platform"},
            {"company_id": 5, "role": "Database Administrator", "required_skills": "sql,mysql,python", "description": "Manage and optimize database systems. Ensure data integrity and performance.", "application_method": "email"},
            {"company_id": 4, "role": "Software Engineer", "required_skills": "python,java,sql,javascript", "description": "Build scalable software solutions. Collaborate with cross-functional teams.", "application_method": "platform"},
        ]
        for jd in jobs_data:
            db.session.add(Job(**jd))
        db.session.commit()
        print("✅ Sample companies and jobs seeded")


def seed_skill_resources():
    """Seed comprehensive skill→course/playlist mapping data."""
    if SkillResource.query.count() > 0:
        return

    resources = [
        # ── Python ──
        {"skill_name": "python", "course_name": "Python for Everybody Specialization", "platform": "Coursera", "course_link": "https://www.coursera.org/specializations/python", "resource_type": "course", "difficulty": "Beginner", "duration": "8 months"},
        {"skill_name": "python", "course_name": "100 Days of Code: Python Bootcamp", "platform": "Udemy", "course_link": "https://www.udemy.com/course/100-days-of-code/", "resource_type": "course", "difficulty": "Beginner", "duration": "60 hours"},
        {"skill_name": "python", "course_name": "Python Full Course for Beginners", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=_uQrJ0TkZlc", "resource_type": "playlist", "difficulty": "Beginner", "duration": "6 hours"},
        {"skill_name": "python", "course_name": "Automate the Boring Stuff with Python", "platform": "Udemy", "course_link": "https://www.udemy.com/course/automate/", "resource_type": "course", "difficulty": "Intermediate", "duration": "10 hours"},
        {"skill_name": "python", "course_name": "Python Advanced Tutorials", "platform": "YouTube", "course_link": "https://www.youtube.com/playlist?list=PLqnslRFeH2UqLwzS0AWYaYe200atBIzMb", "resource_type": "playlist", "difficulty": "Advanced", "duration": "5 hours"},

        # ── JavaScript ──
        {"skill_name": "javascript", "course_name": "The Complete JavaScript Course 2024", "platform": "Udemy", "course_link": "https://www.udemy.com/course/the-complete-javascript-course/", "resource_type": "course", "difficulty": "Beginner", "duration": "69 hours"},
        {"skill_name": "javascript", "course_name": "JavaScript Full Course", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=PkZNo7MFNFg", "resource_type": "playlist", "difficulty": "Beginner", "duration": "3.5 hours"},
        {"skill_name": "javascript", "course_name": "JavaScript Algorithms and Data Structures", "platform": "freeCodeCamp", "course_link": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "resource_type": "course", "difficulty": "Intermediate", "duration": "300 hours"},
        {"skill_name": "javascript", "course_name": "Advanced JavaScript Concepts", "platform": "Udemy", "course_link": "https://www.udemy.com/course/advanced-javascript-concepts/", "resource_type": "course", "difficulty": "Advanced", "duration": "25 hours"},

        # ── React ──
        {"skill_name": "react", "course_name": "React - The Complete Guide 2024", "platform": "Udemy", "course_link": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "resource_type": "course", "difficulty": "Beginner", "duration": "68 hours"},
        {"skill_name": "react", "course_name": "Full React Course 2024", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=bMknfKXIFA8", "resource_type": "playlist", "difficulty": "Beginner", "duration": "12 hours"},
        {"skill_name": "react", "course_name": "React Front To Back", "platform": "Udemy", "course_link": "https://www.udemy.com/course/modern-react-front-to-back/", "resource_type": "course", "difficulty": "Intermediate", "duration": "14 hours"},

        # ── SQL / MySQL ──
        {"skill_name": "sql", "course_name": "The Complete SQL Bootcamp", "platform": "Udemy", "course_link": "https://www.udemy.com/course/the-complete-sql-bootcamp/", "resource_type": "course", "difficulty": "Beginner", "duration": "9 hours"},
        {"skill_name": "sql", "course_name": "SQL Tutorial - Full Database Course", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=HXV3zeQKqGY", "resource_type": "playlist", "difficulty": "Beginner", "duration": "4 hours"},
        {"skill_name": "sql", "course_name": "Advanced SQL for Data Scientists", "platform": "Coursera", "course_link": "https://www.coursera.org/learn/advanced-sql", "resource_type": "course", "difficulty": "Advanced", "duration": "4 weeks"},
        {"skill_name": "mysql", "course_name": "MySQL for Data Analytics", "platform": "Udemy", "course_link": "https://www.udemy.com/course/mysql-for-data-analytics/", "resource_type": "course", "difficulty": "Intermediate", "duration": "8 hours"},
        {"skill_name": "mysql", "course_name": "MySQL Full Course", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=7S_tz1z_5bA", "resource_type": "playlist", "difficulty": "Beginner", "duration": "3 hours"},

        # ── HTML ──
        {"skill_name": "html", "course_name": "HTML and CSS for Beginners", "platform": "Udemy", "course_link": "https://www.udemy.com/course/html-and-css-for-beginners-crash-course-learn-fast-easy/", "resource_type": "course", "difficulty": "Beginner", "duration": "6 hours"},
        {"skill_name": "html", "course_name": "HTML Full Course - Build a Website", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=pQN-pnXPaVg", "resource_type": "playlist", "difficulty": "Beginner", "duration": "2 hours"},

        # ── CSS ──
        {"skill_name": "css", "course_name": "CSS - The Complete Guide 2024", "platform": "Udemy", "course_link": "https://www.udemy.com/course/css-the-complete-guide-incl-flexbox-grid-sass/", "resource_type": "course", "difficulty": "Beginner", "duration": "23 hours"},
        {"skill_name": "css", "course_name": "CSS Crash Course For Absolute Beginners", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=yfoY53QXEnI", "resource_type": "playlist", "difficulty": "Beginner", "duration": "1.5 hours"},
        {"skill_name": "css", "course_name": "Advanced CSS and Sass", "platform": "Udemy", "course_link": "https://www.udemy.com/course/advanced-css-and-sass/", "resource_type": "course", "difficulty": "Advanced", "duration": "28 hours"},

        # ── Flask ──
        {"skill_name": "flask", "course_name": "REST APIs with Flask and Python", "platform": "Udemy", "course_link": "https://www.udemy.com/course/rest-api-flask-and-python/", "resource_type": "course", "difficulty": "Intermediate", "duration": "17 hours"},
        {"skill_name": "flask", "course_name": "Flask Tutorial - Full Course for Beginners", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=Z1RJmh_OqeA", "resource_type": "playlist", "difficulty": "Beginner", "duration": "6 hours"},

        # ── Django ──
        {"skill_name": "django", "course_name": "Python Django - The Practical Guide", "platform": "Udemy", "course_link": "https://www.udemy.com/course/python-django-the-practical-guide/", "resource_type": "course", "difficulty": "Beginner", "duration": "23 hours"},
        {"skill_name": "django", "course_name": "Django Tutorial for Beginners", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=rHux0gMZ3Eg", "resource_type": "playlist", "difficulty": "Beginner", "duration": "4 hours"},
        {"skill_name": "django", "course_name": "Django REST Framework Full Course", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=c708Nf0cHrs", "resource_type": "playlist", "difficulty": "Intermediate", "duration": "7 hours"},

        # ── Machine Learning ──
        {"skill_name": "machine learning", "course_name": "Machine Learning by Andrew Ng", "platform": "Coursera", "course_link": "https://www.coursera.org/learn/machine-learning", "resource_type": "course", "difficulty": "Beginner", "duration": "11 weeks"},
        {"skill_name": "machine learning", "course_name": "Machine Learning A-Z", "platform": "Udemy", "course_link": "https://www.udemy.com/course/machinelearning/", "resource_type": "course", "difficulty": "Intermediate", "duration": "44 hours"},
        {"skill_name": "machine learning", "course_name": "Machine Learning Full Course", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=GwIo3gDZCVQ", "resource_type": "playlist", "difficulty": "Beginner", "duration": "12 hours"},
        {"skill_name": "machine learning", "course_name": "ML with Python - Full Course", "platform": "freeCodeCamp", "course_link": "https://www.freecodecamp.org/learn/machine-learning-with-python/", "resource_type": "course", "difficulty": "Intermediate", "duration": "300 hours"},

        # ── Data Analysis ──
        {"skill_name": "data analysis", "course_name": "Google Data Analytics Certificate", "platform": "Coursera", "course_link": "https://www.coursera.org/professional-certificates/google-data-analytics", "resource_type": "course", "difficulty": "Beginner", "duration": "6 months"},
        {"skill_name": "data analysis", "course_name": "Data Analysis with Python", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=r-uOLxNrNk8", "resource_type": "playlist", "difficulty": "Beginner", "duration": "4.5 hours"},
        {"skill_name": "data analysis", "course_name": "Python for Data Analysis Bootcamp", "platform": "Udemy", "course_link": "https://www.udemy.com/course/learning-python-for-data-analysis-and-visualization/", "resource_type": "course", "difficulty": "Intermediate", "duration": "21 hours"},

        # ── Excel ──
        {"skill_name": "excel", "course_name": "Microsoft Excel - Data Analysis with Pivot Tables", "platform": "Udemy", "course_link": "https://www.udemy.com/course/microsoft-excel-data-analysis-with-excel-pivot-tables/", "resource_type": "course", "difficulty": "Beginner", "duration": "7 hours"},
        {"skill_name": "excel", "course_name": "Excel Tutorial for Beginners", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=Vl0H-qTclOg", "resource_type": "playlist", "difficulty": "Beginner", "duration": "2.5 hours"},

        # ── Java ──
        {"skill_name": "java", "course_name": "Java Programming Masterclass", "platform": "Udemy", "course_link": "https://www.udemy.com/course/java-the-complete-java-developer-course/", "resource_type": "course", "difficulty": "Beginner", "duration": "80 hours"},
        {"skill_name": "java", "course_name": "Java Tutorial for Beginners", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=eIrMbAQSU34", "resource_type": "playlist", "difficulty": "Beginner", "duration": "2.5 hours"},
        {"skill_name": "java", "course_name": "Java Full Course for Developers", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=xk4_1vDrzzo", "resource_type": "playlist", "difficulty": "Intermediate", "duration": "12 hours"},

        # ── C / C++ ──
        {"skill_name": "c", "course_name": "C Programming For Beginners", "platform": "Udemy", "course_link": "https://www.udemy.com/course/c-programming-for-beginners-/", "resource_type": "course", "difficulty": "Beginner", "duration": "23 hours"},
        {"skill_name": "c", "course_name": "C Programming Tutorial for Beginners", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=KJgsSFOSQv0", "resource_type": "playlist", "difficulty": "Beginner", "duration": "3.5 hours"},
        {"skill_name": "c++", "course_name": "Beginning C++ Programming", "platform": "Udemy", "course_link": "https://www.udemy.com/course/beginning-c-plus-plus-programming/", "resource_type": "course", "difficulty": "Beginner", "duration": "46 hours"},
        {"skill_name": "c++", "course_name": "C++ Full Course for Beginners", "platform": "YouTube", "course_link": "https://www.youtube.com/watch?v=vLnPwxZdW4Y", "resource_type": "playlist", "difficulty": "Beginner", "duration": "4 hours"},
    ]

    for r in resources:
        db.session.add(SkillResource(**r))
    db.session.commit()
    print("✅ Skill resources (courses, playlists, tutorials) seeded")


def seed_skill_roadmaps():
    """Seed structured step-by-step learning roadmaps for multiple skills."""
    if SkillRoadmap.query.count() > 0:
        return

    roadmaps = [
        # ═══════════ Machine Learning ═══════════
        {"skill_name": "Machine Learning", "step_number": 1, "step_title": "Learn Python Basics", "description": "Master Python fundamentals — variables, loops, functions, data structures. Python is the primary language for ML.", "tools": "Python, Jupyter Notebook", "resource_title": "Python for Everybody Specialization", "resource_link": "https://www.coursera.org/specializations/python", "platform": "Coursera"},
        {"skill_name": "Machine Learning", "step_number": 2, "step_title": "Learn Data Analysis", "description": "Learn to manipulate and analyze data. Understand data cleaning, transformation, and visualization.", "tools": "NumPy, Pandas, Matplotlib", "resource_title": "Data Analysis with Python", "resource_link": "https://www.youtube.com/watch?v=r-uOLxNrNk8", "platform": "YouTube"},
        {"skill_name": "Machine Learning", "step_number": 3, "step_title": "Learn ML Fundamentals", "description": "Understand supervised vs unsupervised learning, training/testing splits, evaluation metrics, and bias-variance tradeoff.", "tools": None, "resource_title": "Machine Learning by Andrew Ng", "resource_link": "https://www.coursera.org/learn/machine-learning", "platform": "Coursera"},
        {"skill_name": "Machine Learning", "step_number": 4, "step_title": "Learn ML Algorithms", "description": "Deep dive into core algorithms: linear/logistic regression, decision trees, SVM, KNN, random forests, and clustering.", "tools": "Regression, Classification, Clustering", "resource_title": "Machine Learning A-Z", "resource_link": "https://www.udemy.com/course/machinelearning/", "platform": "Udemy"},
        {"skill_name": "Machine Learning", "step_number": 5, "step_title": "Learn ML Frameworks", "description": "Get hands-on with industry-standard ML frameworks for building and deploying models.", "tools": "Scikit-learn, TensorFlow, PyTorch", "resource_title": "ML with Python - Full Course", "resource_link": "https://www.freecodecamp.org/learn/machine-learning-with-python/", "platform": "freeCodeCamp"},
        {"skill_name": "Machine Learning", "step_number": 6, "step_title": "Build ML Projects", "description": "Apply your knowledge by building real-world projects to solidify understanding and build your portfolio.", "tools": "Spam Detection, Recommendation System, Image Classification", "resource_title": "Machine Learning Full Course", "resource_link": "https://www.youtube.com/watch?v=GwIo3gDZCVQ", "platform": "YouTube"},

        # ═══════════ Data Science ═══════════
        {"skill_name": "Data Science", "step_number": 1, "step_title": "Learn Python for Data Science", "description": "Master Python with a focus on data-centric libraries and scripting.", "tools": "Python, Anaconda", "resource_title": "Python for Data Science", "resource_link": "https://www.coursera.org/specializations/python", "platform": "Coursera"},
        {"skill_name": "Data Science", "step_number": 2, "step_title": "Learn Statistics & Probability", "description": "Understand descriptive statistics, probability distributions, hypothesis testing, and confidence intervals.", "tools": "Statistics, Probability", "resource_title": "Statistics Foundations", "resource_link": "https://www.youtube.com/watch?v=xxpc-HPKN28", "platform": "YouTube"},
        {"skill_name": "Data Science", "step_number": 3, "step_title": "Data Manipulation & Cleaning", "description": "Master data wrangling with Pandas: merging, grouping, pivoting, handling missing values.", "tools": "Pandas, NumPy", "resource_title": "Python for Data Analysis Bootcamp", "resource_link": "https://www.udemy.com/course/learning-python-for-data-analysis-and-visualization/", "platform": "Udemy"},
        {"skill_name": "Data Science", "step_number": 4, "step_title": "Data Visualization", "description": "Create compelling charts and dashboards to communicate insights effectively.", "tools": "Matplotlib, Seaborn, Plotly, Tableau", "resource_title": "Data Visualization with Python", "resource_link": "https://www.youtube.com/watch?v=_YWwU-gJI5U", "platform": "YouTube"},
        {"skill_name": "Data Science", "step_number": 5, "step_title": "Machine Learning for Data Science", "description": "Apply ML algorithms to real datasets for prediction, classification, and pattern discovery.", "tools": "Scikit-learn, XGBoost", "resource_title": "Google Data Analytics Certificate", "resource_link": "https://www.coursera.org/professional-certificates/google-data-analytics", "platform": "Coursera"},
        {"skill_name": "Data Science", "step_number": 6, "step_title": "Build a Data Science Portfolio", "description": "Create end-to-end projects: EDA, feature engineering, modeling, and presentation.", "tools": "Kaggle, GitHub, Jupyter", "resource_title": "Kaggle Competitions", "resource_link": "https://www.kaggle.com/competitions", "platform": "Kaggle"},

        # ═══════════ Python ═══════════
        {"skill_name": "Python", "step_number": 1, "step_title": "Python Fundamentals", "description": "Learn variables, data types, operators, input/output, and basic syntax.", "tools": "Python 3, VS Code", "resource_title": "Python Full Course for Beginners", "resource_link": "https://www.youtube.com/watch?v=_uQrJ0TkZlc", "platform": "YouTube"},
        {"skill_name": "Python", "step_number": 2, "step_title": "Control Flow & Functions", "description": "Master if/else, loops, functions, scope, and lambda expressions.", "tools": None, "resource_title": "100 Days of Code: Python Bootcamp", "resource_link": "https://www.udemy.com/course/100-days-of-code/", "platform": "Udemy"},
        {"skill_name": "Python", "step_number": 3, "step_title": "Object-Oriented Programming", "description": "Understand classes, objects, inheritance, polymorphism, encapsulation.", "tools": "Classes, Inheritance, Decorators", "resource_title": "Python OOP Tutorial", "resource_link": "https://www.youtube.com/watch?v=ZDa-Z5JzLYM", "platform": "YouTube"},
        {"skill_name": "Python", "step_number": 4, "step_title": "Modules & File Handling", "description": "Work with built-in modules, third-party packages, file I/O, and error handling.", "tools": "pip, os, json, csv", "resource_title": "Automate the Boring Stuff with Python", "resource_link": "https://www.udemy.com/course/automate/", "platform": "Udemy"},
        {"skill_name": "Python", "step_number": 5, "step_title": "Web Development with Python", "description": "Build web applications and REST APIs using Python frameworks.", "tools": "Flask, Django, FastAPI", "resource_title": "Flask Tutorial - Full Course", "resource_link": "https://www.youtube.com/watch?v=Z1RJmh_OqeA", "platform": "YouTube"},
        {"skill_name": "Python", "step_number": 6, "step_title": "Build Python Projects", "description": "Create portfolio projects: web scraper, API, automation tool, data dashboard.", "tools": "Requests, BeautifulSoup, Selenium", "resource_title": "Python Advanced Tutorials", "resource_link": "https://www.youtube.com/playlist?list=PLqnslRFeH2UqLwzS0AWYaYe200atBIzMb", "platform": "YouTube"},

        # ═══════════ Web Development ═══════════
        {"skill_name": "Web Development", "step_number": 1, "step_title": "Learn HTML", "description": "Understand HTML structure: elements, attributes, forms, semantic tags, and accessibility.", "tools": "HTML5", "resource_title": "HTML Full Course - Build a Website", "resource_link": "https://www.youtube.com/watch?v=pQN-pnXPaVg", "platform": "YouTube"},
        {"skill_name": "Web Development", "step_number": 2, "step_title": "Learn CSS", "description": "Style web pages with CSS: selectors, box model, flexbox, grid, animations, responsive design.", "tools": "CSS3, Flexbox, Grid", "resource_title": "CSS - The Complete Guide 2024", "resource_link": "https://www.udemy.com/course/css-the-complete-guide-incl-flexbox-grid-sass/", "platform": "Udemy"},
        {"skill_name": "Web Development", "step_number": 3, "step_title": "Learn JavaScript", "description": "Master JavaScript fundamentals: DOM manipulation, events, async/await, ES6+ features.", "tools": "JavaScript, ES6+", "resource_title": "The Complete JavaScript Course 2024", "resource_link": "https://www.udemy.com/course/the-complete-javascript-course/", "platform": "Udemy"},
        {"skill_name": "Web Development", "step_number": 4, "step_title": "Learn a Frontend Framework", "description": "Build dynamic single-page applications with a modern framework.", "tools": "React, Vue.js, Angular", "resource_title": "React - The Complete Guide 2024", "resource_link": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "platform": "Udemy"},
        {"skill_name": "Web Development", "step_number": 5, "step_title": "Learn Backend Development", "description": "Build APIs and server-side logic with Node.js or Python frameworks.", "tools": "Node.js, Express, Flask, Django", "resource_title": "REST APIs with Flask and Python", "resource_link": "https://www.udemy.com/course/rest-api-flask-and-python/", "platform": "Udemy"},
        {"skill_name": "Web Development", "step_number": 6, "step_title": "Databases & Deployment", "description": "Integrate databases and deploy your applications to the cloud.", "tools": "SQL, MongoDB, Heroku, Vercel, AWS", "resource_title": "SQL Tutorial - Full Database Course", "resource_link": "https://www.youtube.com/watch?v=HXV3zeQKqGY", "platform": "YouTube"},

        # ═══════════ React ═══════════
        {"skill_name": "React", "step_number": 1, "step_title": "JavaScript Prerequisites", "description": "Ensure strong JS fundamentals: ES6, arrow functions, destructuring, promises, array methods.", "tools": "JavaScript ES6+", "resource_title": "JavaScript Full Course", "resource_link": "https://www.youtube.com/watch?v=PkZNo7MFNFg", "platform": "YouTube"},
        {"skill_name": "React", "step_number": 2, "step_title": "React Basics", "description": "Learn JSX, components, props, state, and the component lifecycle.", "tools": "React, JSX, Create React App", "resource_title": "Full React Course 2024", "resource_link": "https://www.youtube.com/watch?v=bMknfKXIFA8", "platform": "YouTube"},
        {"skill_name": "React", "step_number": 3, "step_title": "Hooks & State Management", "description": "Master useState, useEffect, useContext, useReducer, and custom hooks.", "tools": "React Hooks, Context API", "resource_title": "React - The Complete Guide 2024", "resource_link": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "platform": "Udemy"},
        {"skill_name": "React", "step_number": 4, "step_title": "Routing & API Integration", "description": "Implement client-side routing and connect to backend APIs.", "tools": "React Router, Axios, Fetch API", "resource_title": "React Front To Back", "resource_link": "https://www.udemy.com/course/modern-react-front-to-back/", "platform": "Udemy"},
        {"skill_name": "React", "step_number": 5, "step_title": "Advanced Patterns", "description": "Learn Redux, performance optimization, testing, and advanced component patterns.", "tools": "Redux, React Testing Library, Memo", "resource_title": "Advanced React Patterns", "resource_link": "https://www.youtube.com/watch?v=MSq_DCRxOxw", "platform": "YouTube"},
        {"skill_name": "React", "step_number": 6, "step_title": "Build React Projects", "description": "Build full-stack apps: e-commerce store, social media dashboard, task manager.", "tools": "Full-Stack App, REST API, Tailwind CSS", "resource_title": "React Projects Course", "resource_link": "https://www.youtube.com/watch?v=a_7Z7C_JCyo", "platform": "YouTube"},

        # ═══════════ Docker ═══════════
        {"skill_name": "Docker", "step_number": 1, "step_title": "Understand Containers", "description": "Learn what containers are, how they differ from VMs, and why containerization matters.", "tools": None, "resource_title": "Docker in 100 Seconds", "resource_link": "https://www.youtube.com/watch?v=Gjnup-PuquQ", "platform": "YouTube"},
        {"skill_name": "Docker", "step_number": 2, "step_title": "Docker Fundamentals", "description": "Install Docker, learn Docker CLI, images, containers, and basic commands (run, stop, rm, logs).", "tools": "Docker CLI, Docker Desktop", "resource_title": "Docker Tutorial for Beginners", "resource_link": "https://www.youtube.com/watch?v=fqMOX6JJhGo", "platform": "YouTube"},
        {"skill_name": "Docker", "step_number": 3, "step_title": "Dockerfiles & Images", "description": "Write Dockerfiles to create custom images. Understand layers, caching, multi-stage builds.", "tools": "Dockerfile, Docker Build", "resource_title": "Docker & Kubernetes Course", "resource_link": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/", "platform": "Udemy"},
        {"skill_name": "Docker", "step_number": 4, "step_title": "Docker Compose", "description": "Orchestrate multi-container applications using docker-compose.yml files.", "tools": "Docker Compose, YAML", "resource_title": "Docker Compose Tutorial", "resource_link": "https://www.youtube.com/watch?v=HG6yIjZapSA", "platform": "YouTube"},
        {"skill_name": "Docker", "step_number": 5, "step_title": "Docker Networking & Volumes", "description": "Manage container networking, persistent storage, and data volumes.", "tools": "Bridge Networks, Volumes, Bind Mounts", "resource_title": "Docker Networking Deep Dive", "resource_link": "https://www.youtube.com/watch?v=bKFMS5C4CG0", "platform": "YouTube"},
        {"skill_name": "Docker", "step_number": 6, "step_title": "Docker in Production", "description": "Deploy containerized apps, use registries, and integrate Docker with CI/CD pipelines.", "tools": "Docker Hub, GitHub Actions, AWS ECS", "resource_title": "Docker for DevOps", "resource_link": "https://www.udemy.com/course/docker-mastery/", "platform": "Udemy"},

        # ═══════════ Cybersecurity ═══════════
        {"skill_name": "Cybersecurity", "step_number": 1, "step_title": "Networking Fundamentals", "description": "Learn TCP/IP, DNS, HTTP/S, firewalls, and how the internet works.", "tools": "TCP/IP, DNS, HTTP", "resource_title": "Networking Fundamentals", "resource_link": "https://www.youtube.com/watch?v=qiQR5rTSshw", "platform": "YouTube"},
        {"skill_name": "Cybersecurity", "step_number": 2, "step_title": "Linux Basics", "description": "Master the Linux command line — essential for security tools and server administration.", "tools": "Linux, Bash, Terminal", "resource_title": "Linux for Ethical Hackers", "resource_link": "https://www.youtube.com/watch?v=U1w4T03B30I", "platform": "YouTube"},
        {"skill_name": "Cybersecurity", "step_number": 3, "step_title": "Security Concepts", "description": "Understand CIA triad, authentication, authorization, encryption, hashing, and common vulnerabilities.", "tools": "OWASP Top 10, CIA Triad", "resource_title": "Cybersecurity Full Course", "resource_link": "https://www.youtube.com/watch?v=PlHnamdwGmw", "platform": "YouTube"},
        {"skill_name": "Cybersecurity", "step_number": 4, "step_title": "Ethical Hacking", "description": "Learn penetration testing methodologies: reconnaissance, scanning, exploitation, post-exploitation.", "tools": "Kali Linux, Nmap, Metasploit, Burp Suite", "resource_title": "Ethical Hacking Course", "resource_link": "https://www.udemy.com/course/learn-ethical-hacking-from-scratch/", "platform": "Udemy"},
        {"skill_name": "Cybersecurity", "step_number": 5, "step_title": "Web Application Security", "description": "Master OWASP Top 10: SQL injection, XSS, CSRF, authentication flaws, and how to prevent them.", "tools": "OWASP ZAP, Burp Suite, SQLMap", "resource_title": "Web Security Academy", "resource_link": "https://portswigger.net/web-security", "platform": "PortSwigger"},
        {"skill_name": "Cybersecurity", "step_number": 6, "step_title": "Certifications & Practice", "description": "Prepare for industry certifications and practice on CTF platforms.", "tools": "CompTIA Security+, CEH, TryHackMe, HackTheBox", "resource_title": "TryHackMe Learning Paths", "resource_link": "https://tryhackme.com/paths", "platform": "TryHackMe"},
    ]

    for r in roadmaps:
        db.session.add(SkillRoadmap(**r))
    db.session.commit()
    print("✅ Skill roadmaps seeded (7 skills, 42 steps)")


with app.app_context():
    db.create_all()
    seed_admin()
    seed_sample_data()
    seed_skill_resources()
    seed_skill_roadmaps()


if __name__ == "__main__":
    app.run(debug=True, port=5001)
