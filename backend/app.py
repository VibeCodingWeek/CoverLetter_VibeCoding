from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import jwt
import datetime
import re
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains and routes

# Secret key for JWT tokens (in production, use environment variable)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-here')

# Database configuration
DATABASE = 'users.db'

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with users table"""
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    """Validate password strength"""
    if len(password) < 6:
        return False, "Password must be at least 6 characters long"
    return True, ""

def generate_token(user_id, username):
    """Generate JWT token"""
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)  # Token expires in 7 days
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token_from_request():
    """Verify JWT token from request header and return user info"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    try:
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None

# ============= AUTHENTICATION ENDPOINTS =============

@app.route('/api/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(key in data for key in ['username', 'email', 'password']):
            return jsonify({'message': 'Missing required fields'}), 400
        
        username = data['username'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validate input
        if not username:
            return jsonify({'message': 'Username is required'}), 400
        
        if not validate_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        is_valid_password, password_error = validate_password(password)
        if not is_valid_password:
            return jsonify({'message': password_error}), 400
        
        conn = get_db_connection()
        
        # Check if user already exists
        existing_user = conn.execute(
            'SELECT id FROM users WHERE email = ? OR username = ?',
            (email, username)
        ).fetchone()
        
        if existing_user:
            conn.close()
            return jsonify({'message': 'User with this email or username already exists'}), 409
        
        # Hash password and create user
        password_hash = generate_password_hash(password)
        
        cursor = conn.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (username, email, password_hash)
        )
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Generate token
        token = generate_token(user_id, username)
        
        return jsonify({
            'message': 'User created successfully',
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            },
            'token': token
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or not all(key in data for key in ['email', 'password']):
            return jsonify({'message': 'Email and password are required'}), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        
        conn = get_db_connection()
        user = conn.execute(
            'SELECT id, username, email, password_hash FROM users WHERE email = ?',
            (email,)
        ).fetchone()
        conn.close()
        
        if not user or not check_password_hash(user['password_hash'], password):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(user['id'], user['username'])
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email']
            },
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Simple forgot password - verify user exists and allow new password"""
    try:
        data = request.get_json()
        
        if not data or 'email' not in data:
            return jsonify({'message': 'Email is required'}), 400
        
        email = data['email'].strip().lower()
        
        if not validate_email(email):
            return jsonify({'message': 'Invalid email format'}), 400
        
        conn = get_db_connection()
        user = conn.execute(
            'SELECT id, username, email FROM users WHERE email = ?',
            (email,)
        ).fetchone()
        
        if not user:
            conn.close()
            return jsonify({'message': 'No account found with this email address'}), 404
        
        conn.close()
        return jsonify({
            'message': 'User found. You can now set a new password.',
            'user_exists': True,
            'username': user['username']
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Reset password for existing user"""
    try:
        data = request.get_json()
        
        if not data or not all(key in data for key in ['email', 'newPassword']):
            return jsonify({'message': 'Email and new password are required'}), 400
        
        email = data['email'].strip().lower()
        new_password = data['newPassword']
        
        # Validate new password
        is_valid_password, password_error = validate_password(new_password)
        if not is_valid_password:
            return jsonify({'message': password_error}), 400
        
        conn = get_db_connection()
        user = conn.execute(
            'SELECT id, username FROM users WHERE email = ?',
            (email,)
        ).fetchone()
        
        if not user:
            conn.close()
            return jsonify({'message': 'User not found'}), 404
        
        # Update password
        new_password_hash = generate_password_hash(new_password)
        conn.execute(
            'UPDATE users SET password_hash = ? WHERE email = ?',
            (new_password_hash, email)
        )
        conn.commit()
        conn.close()
        
        # Generate new token and log user in
        token = generate_token(user['id'], user['username'])
        
        return jsonify({
            'message': 'Password reset successful. You are now logged in.',
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': email
            },
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/verify-token', methods=['GET'])
def verify_token():
    """Verify JWT token endpoint"""
    try:
        user_info = verify_token_from_request()
        if not user_info:
            return jsonify({'message': 'No valid token provided'}), 401
        
        return jsonify({
            'valid': True,
            'user_id': user_info['user_id'],
            'username': user_info['username']
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

# ============= COVER LETTER ENDPOINTS =============

@app.route('/api/cover-letter', methods=['GET', 'POST', 'PUT'])
def handle_cover_letter():
    """Handle cover letter data"""
    user_info = verify_token_from_request()
    if not user_info:
        return jsonify({'message': 'Authentication required'}), 401
    
    user_id = user_info['user_id']
    
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            # Get user's latest cover letter data
            cover_letter = conn.execute(
                'SELECT * FROM cover_letters WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
                (user_id,)
            ).fetchone()
            
            if cover_letter:
                data = dict(cover_letter)
                # Convert snake_case to camelCase for frontend
                frontend_data = {
                    'fullName': data.get('full_name', ''),
                    'email': data.get('email', ''),
                    'phone': data.get('phone', ''),
                    'address': data.get('address', ''),
                    'companyName': data.get('company_name', ''),
                    'jobTitle': data.get('job_title', ''),
                    'hiringManager': data.get('hiring_manager', ''),
                    'skills': data.get('skills', ''),
                    'experience': data.get('experience', ''),
                    'education': data.get('education', ''),
                    'achievements': data.get('achievements', ''),
                    'whyCompany': data.get('why_company', ''),
                    'whyPosition': data.get('why_position', ''),
                    'generatedContent': data.get('generated_content', '')
                }
                conn.close()
                return jsonify({'data': frontend_data}), 200
            else:
                conn.close()
                return jsonify({'data': {}}), 200
        
        elif request.method in ['POST', 'PUT']:
            # Save/update cover letter data
            data = request.get_json()
            if not data:
                return jsonify({'message': 'No data provided'}), 400
            
            # Check if user already has a cover letter
            existing = conn.execute(
                'SELECT id FROM cover_letters WHERE user_id = ?',
                (user_id,)
            ).fetchone()
            
            if existing:
                # Update existing
                conn.execute('''
                    UPDATE cover_letters SET
                        full_name = ?, email = ?, phone = ?, address = ?,
                        company_name = ?, job_title = ?, hiring_manager = ?,
                        skills = ?, experience = ?, education = ?, achievements = ?,
                        why_company = ?, why_position = ?, generated_content = ?,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                ''', (
                    data.get('fullName', ''), data.get('email', ''), data.get('phone', ''),
                    data.get('address', ''), data.get('companyName', ''), data.get('jobTitle', ''),
                    data.get('hiringManager', ''), data.get('skills', ''), data.get('experience', ''),
                    data.get('education', ''), data.get('achievements', ''), data.get('whyCompany', ''),
                    data.get('whyPosition', ''), data.get('generatedContent', ''), user_id
                ))
            else:
                # Create new
                conn.execute('''
                    INSERT INTO cover_letters (
                        user_id, full_name, email, phone, address, company_name,
                        job_title, hiring_manager, skills, experience, education,
                        achievements, why_company, why_position, generated_content
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    user_id, data.get('fullName', ''), data.get('email', ''), data.get('phone', ''),
                    data.get('address', ''), data.get('companyName', ''), data.get('jobTitle', ''),
                    data.get('hiringManager', ''), data.get('skills', ''), data.get('experience', ''),
                    data.get('education', ''), data.get('achievements', ''), data.get('whyCompany', ''),
                    data.get('whyPosition', ''), data.get('generatedContent', '')
                ))
            
            conn.commit()
            conn.close()
            return jsonify({'message': 'Cover letter data saved successfully'}), 200
            
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

# ============= JOB APPLICATIONS ENDPOINTS =============

@app.route('/api/job-applications', methods=['GET', 'POST'])
def handle_job_applications():
    """Handle job applications data"""
    user_info = verify_token_from_request()
    if not user_info:
        return jsonify({'message': 'Authentication required'}), 401
    
    user_id = user_info['user_id']
    
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            # Get all job applications for user
            applications = conn.execute(
                'SELECT * FROM job_applications WHERE user_id = ? ORDER BY created_at DESC',
                (user_id,)
            ).fetchall()
            
            apps_list = []
            for app in applications:
                app_dict = dict(app)
                # Convert to frontend format
                frontend_app = {
                    'id': app_dict['id'],
                    'company': app_dict['company'],
                    'position': app_dict['position'],
                    'location': app_dict['location'],
                    'salary': app_dict['salary'],
                    'jobUrl': app_dict['job_url'],
                    'status': app_dict['status'],
                    'dateApplied': app_dict['date_applied'],
                    'followUpDate': app_dict['follow_up_date'],
                    'notes': app_dict['notes'],
                    'contactPerson': app_dict['contact_person'],
                    'contactEmail': app_dict['contact_email']
                }
                apps_list.append(frontend_app)
            
            conn.close()
            return jsonify({'applications': apps_list}), 200
        
        elif request.method == 'POST':
            # Create new job application
            data = request.get_json()
            if not data or not all(key in data for key in ['company', 'position']):
                return jsonify({'message': 'Company and position are required'}), 400
            
            cursor = conn.execute('''
                INSERT INTO job_applications (
                    user_id, company, position, location, salary, job_url,
                    status, date_applied, follow_up_date, notes, contact_person, contact_email
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_id, data['company'], data['position'], data.get('location', ''),
                data.get('salary', ''), data.get('jobUrl', ''), data.get('status', 'applied'),
                data.get('dateApplied'), data.get('followUpDate'), data.get('notes', ''),
                data.get('contactPerson', ''), data.get('contactEmail', '')
            ))
            
            app_id = cursor.lastrowid
            conn.commit()
            conn.close()
            
            return jsonify({'message': 'Job application created successfully', 'id': app_id}), 201
            
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/job-applications/<int:app_id>', methods=['PUT', 'DELETE'])
def handle_job_application(app_id):
    """Handle individual job application"""
    user_info = verify_token_from_request()
    if not user_info:
        return jsonify({'message': 'Authentication required'}), 401
    
    user_id = user_info['user_id']
    
    try:
        conn = get_db_connection()
        
        # Verify application belongs to user
        app = conn.execute(
            'SELECT id FROM job_applications WHERE id = ? AND user_id = ?',
            (app_id, user_id)
        ).fetchone()
        
        if not app:
            conn.close()
            return jsonify({'message': 'Job application not found'}), 404
        
        if request.method == 'PUT':
            # Update job application
            data = request.get_json()
            if not data:
                return jsonify({'message': 'No data provided'}), 400
            
            conn.execute('''
                UPDATE job_applications SET
                    company = ?, position = ?, location = ?, salary = ?, job_url = ?,
                    status = ?, date_applied = ?, follow_up_date = ?, notes = ?,
                    contact_person = ?, contact_email = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND user_id = ?
            ''', (
                data.get('company', ''), data.get('position', ''), data.get('location', ''),
                data.get('salary', ''), data.get('jobUrl', ''), data.get('status', 'applied'),
                data.get('dateApplied'), data.get('followUpDate'), data.get('notes', ''),
                data.get('contactPerson', ''), data.get('contactEmail', ''), app_id, user_id
            ))
            
            conn.commit()
            conn.close()
            return jsonify({'message': 'Job application updated successfully'}), 200
        
        elif request.method == 'DELETE':
            # Delete job application
            conn.execute('DELETE FROM job_applications WHERE id = ? AND user_id = ?', (app_id, user_id))
            conn.commit()
            conn.close()
            return jsonify({'message': 'Job application deleted successfully'}), 200
            
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

# ============= RESUME ENDPOINTS =============

@app.route('/api/resume', methods=['GET', 'POST', 'PUT'])
def handle_resume():
    """Handle resume data"""
    user_info = verify_token_from_request()
    if not user_info:
        return jsonify({'message': 'Authentication required'}), 401
    
    user_id = user_info['user_id']
    
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            # Get user's resume data with all related tables
            resume = conn.execute(
                'SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
                (user_id,)
            ).fetchone()
            
            if not resume:
                conn.close()
                return jsonify({'data': {}}), 200
            
            resume_id = resume['id']
            
            # Get all related data
            experience = conn.execute(
                'SELECT * FROM resume_experience WHERE resume_id = ? ORDER BY order_index',
                (resume_id,)
            ).fetchall()
            
            education = conn.execute(
                'SELECT * FROM resume_education WHERE resume_id = ? ORDER BY order_index',
                (resume_id,)
            ).fetchall()
            
            skills = conn.execute(
                'SELECT * FROM resume_skills WHERE resume_id = ? ORDER BY order_index',
                (resume_id,)
            ).fetchall()
            
            projects = conn.execute(
                'SELECT * FROM resume_projects WHERE resume_id = ? ORDER BY order_index',
                (resume_id,)
            ).fetchall()
            
            certifications = conn.execute(
                'SELECT * FROM resume_certifications WHERE resume_id = ? ORDER BY order_index',
                (resume_id,)
            ).fetchall()
            
            # Format data for frontend
            resume_data = {
                'personalInfo': {
                    'fullName': resume['full_name'] or '',
                    'email': resume['email'] or '',
                    'phone': resume['phone'] or '',
                    'address': resume['address'] or '',
                    'linkedin': resume['linkedin'] or '',
                    'website': resume['website'] or '',
                    'summary': resume['summary'] or ''
                },
                'experience': [dict(exp) for exp in experience],
                'education': [dict(edu) for edu in education],
                'skills': [dict(skill) for skill in skills],
                'projects': [dict(proj) for proj in projects],
                'certifications': [dict(cert) for cert in certifications],
                'templateName': resume['template_name']
            }
            
            conn.close()
            return jsonify({'data': resume_data}), 200
        
        elif request.method in ['POST', 'PUT']:
            # Save/update resume data
            data = request.get_json()
            if not data:
                return jsonify({'message': 'No data provided'}), 400
            
            personal_info = data.get('personalInfo', {})
            
            # Check if user already has a resume
            existing = conn.execute(
                'SELECT id FROM resumes WHERE user_id = ?',
                (user_id,)
            ).fetchone()
            
            if existing:
                resume_id = existing['id']
                # Update existing resume
                conn.execute('''
                    UPDATE resumes SET
                        template_name = ?, full_name = ?, email = ?, phone = ?, address = ?,
                        linkedin = ?, website = ?, summary = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE user_id = ?
                ''', (
                    data.get('templateName', 'modern'),
                    personal_info.get('fullName', ''), personal_info.get('email', ''),
                    personal_info.get('phone', ''), personal_info.get('address', ''),
                    personal_info.get('linkedin', ''), personal_info.get('website', ''),
                    personal_info.get('summary', ''), user_id
                ))
                
                # Clear existing related data
                conn.execute('DELETE FROM resume_experience WHERE resume_id = ?', (resume_id,))
                conn.execute('DELETE FROM resume_education WHERE resume_id = ?', (resume_id,))
                conn.execute('DELETE FROM resume_skills WHERE resume_id = ?', (resume_id,))
                conn.execute('DELETE FROM resume_projects WHERE resume_id = ?', (resume_id,))
                conn.execute('DELETE FROM resume_certifications WHERE resume_id = ?', (resume_id,))
            else:
                # Create new resume
                cursor = conn.execute('''
                    INSERT INTO resumes (
                        user_id, template_name, full_name, email, phone, address,
                        linkedin, website, summary
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    user_id, data.get('templateName', 'modern'),
                    personal_info.get('fullName', ''), personal_info.get('email', ''),
                    personal_info.get('phone', ''), personal_info.get('address', ''),
                    personal_info.get('linkedin', ''), personal_info.get('website', ''),
                    personal_info.get('summary', '')
                ))
                resume_id = cursor.lastrowid
            
            # Insert new related data
            for i, exp in enumerate(data.get('experience', [])):
                conn.execute('''
                    INSERT INTO resume_experience (
                        resume_id, company, position, start_date, end_date,
                        description, is_current, order_index
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    resume_id, exp.get('company', ''), exp.get('position', ''),
                    exp.get('startDate', ''), exp.get('endDate', ''),
                    exp.get('description', ''), exp.get('isCurrent', False), i
                ))
            
            for i, edu in enumerate(data.get('education', [])):
                conn.execute('''
                    INSERT INTO resume_education (
                        resume_id, institution, degree, field_of_study,
                        start_date, end_date, gpa, order_index
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    resume_id, edu.get('institution', ''), edu.get('degree', ''),
                    edu.get('fieldOfStudy', ''), edu.get('startDate', ''),
                    edu.get('endDate', ''), edu.get('gpa', ''), i
                ))
            
            for i, skill in enumerate(data.get('skills', [])):
                conn.execute('''
                    INSERT INTO resume_skills (
                        resume_id, skill_name, category, proficiency, order_index
                    ) VALUES (?, ?, ?, ?, ?)
                ''', (
                    resume_id, skill.get('name', ''), skill.get('category', ''),
                    skill.get('proficiency', ''), i
                ))
            
            for i, proj in enumerate(data.get('projects', [])):
                conn.execute('''
                    INSERT INTO resume_projects (
                        resume_id, name, description, technologies, url,
                        start_date, end_date, order_index
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    resume_id, proj.get('name', ''), proj.get('description', ''),
                    proj.get('technologies', ''), proj.get('url', ''),
                    proj.get('startDate', ''), proj.get('endDate', ''), i
                ))
            
            for i, cert in enumerate(data.get('certifications', [])):
                conn.execute('''
                    INSERT INTO resume_certifications (
                        resume_id, name, issuer, date_earned, expiry_date,
                        credential_url, order_index
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    resume_id, cert.get('name', ''), cert.get('issuer', ''),
                    cert.get('dateEarned', ''), cert.get('expiryDate', ''),
                    cert.get('credentialUrl', ''), i
                ))
            
            conn.commit()
            conn.close()
            return jsonify({'message': 'Resume data saved successfully'}), 200
            
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

# ============= INTERVIEW PRACTICE ENDPOINTS =============

@app.route('/api/interview-practice', methods=['GET', 'POST'])
def handle_interview_practice():
    """Handle interview practice data"""
    user_info = verify_token_from_request()
    if not user_info:
        return jsonify({'message': 'Authentication required'}), 401
    
    user_id = user_info['user_id']
    
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            # Get user's practice history
            practices = conn.execute(
                'SELECT * FROM interview_practice WHERE user_id = ? ORDER BY session_date DESC LIMIT 50',
                (user_id,)
            ).fetchall()
            
            practice_list = [dict(practice) for practice in practices]
            conn.close()
            return jsonify({'history': practice_list}), 200
        
        elif request.method == 'POST':
            # Save practice session
            data = request.get_json()
            if not data:
                return jsonify({'message': 'No data provided'}), 400
            
            conn.execute('''
                INSERT INTO interview_practice (
                    user_id, category, question, user_answer, time_taken
                ) VALUES (?, ?, ?, ?, ?)
            ''', (
                user_id, data.get('category', ''), data.get('question', ''),
                data.get('userAnswer', ''), data.get('timeTaken', 0)
            ))
            
            conn.commit()
            conn.close()
            return jsonify({'message': 'Practice session saved successfully'}), 201
            
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

# ============= SALARY INSIGHTS ENDPOINTS =============

@app.route('/api/salary-searches', methods=['GET', 'POST'])
def handle_salary_searches():
    """Handle salary search data"""
    user_info = verify_token_from_request()
    if not user_info:
        return jsonify({'message': 'Authentication required'}), 401
    
    user_id = user_info['user_id']
    
    try:
        conn = get_db_connection()
        
        if request.method == 'GET':
            # Get user's saved searches
            searches = conn.execute(
                'SELECT * FROM salary_searches WHERE user_id = ? ORDER BY search_date DESC',
                (user_id,)
            ).fetchall()
            
            search_list = []
            for search in searches:
                search_dict = dict(search)
                frontend_search = {
                    'id': search_dict['id'],
                    'jobTitle': search_dict['job_title'],
                    'location': search_dict['location'],
                    'experienceLevel': search_dict['experience_level'],
                    'company': search_dict['company'],
                    'savedName': search_dict['saved_name'],
                    'searchDate': search_dict['search_date']
                }
                search_list.append(frontend_search)
            
            conn.close()
            return jsonify({'searches': search_list}), 200
        
        elif request.method == 'POST':
            # Save salary search
            data = request.get_json()
            if not data:
                return jsonify({'message': 'No data provided'}), 400
            
            conn.execute('''
                INSERT INTO salary_searches (
                    user_id, job_title, location, experience_level, company, saved_name
                ) VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                user_id, data.get('jobTitle', ''), data.get('location', ''),
                data.get('experienceLevel', ''), data.get('company', ''),
                data.get('savedName', '')
            ))
            
            conn.commit()
            conn.close()
            return jsonify({'message': 'Salary search saved successfully'}), 201
            
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

# ============= UTILITY ENDPOINTS =============

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users endpoint (for development/testing)"""
    try:
        conn = get_db_connection()
        users = conn.execute(
            'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
        ).fetchall()
        conn.close()
        
        users_list = [dict(user) for user in users]
        return jsonify({'users': users_list}), 200
        
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.datetime.utcnow().isoformat()}), 200

if __name__ == '__main__':
    # Initialize database
    init_db()
    print("Database initialized successfully!")
    print("Starting Flask server...")
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5000) 