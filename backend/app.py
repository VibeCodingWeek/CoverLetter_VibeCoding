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

@app.route('/api/verify-token', methods=['GET'])
def verify_token():
    """Verify JWT token endpoint"""
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'message': 'No valid token provided'}), 401
        
        token = auth_header.split(' ')[1]
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        
        return jsonify({
            'valid': True,
            'user_id': payload['user_id'],
            'username': payload['username']
        }), 200
        
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401
    except Exception as e:
        return jsonify({'message': 'Internal server error'}), 500

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