import pytest
import os
import tempfile
import sqlite3
from app import app, init_db

@pytest.fixture
def client():
    """Create a test client for the Flask application."""
    # Create a temporary database file
    db_fd, app.config['DATABASE'] = tempfile.mkstemp()
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    with app.test_client() as client:
        with app.app_context():
            init_db()
        yield client
    
    # Clean up the temporary database file
    os.close(db_fd)
    os.unlink(app.config['DATABASE'])

@pytest.fixture
def test_user_data():
    """Provide test user data for registration and login."""
    return {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpassword123'
    }

@pytest.fixture
def authenticated_user(client, test_user_data):
    """Create and authenticate a test user, return the token."""
    # Register user
    client.post('/api/signup', json=test_user_data)
    
    # Login user to get token
    response = client.post('/api/login', json={
        'email': test_user_data['email'],
        'password': test_user_data['password']
    })
    
    data = response.get_json()
    return {
        'token': data['token'],
        'user': data['user']
    }

@pytest.fixture
def auth_headers(authenticated_user):
    """Provide authorization headers for authenticated requests."""
    return {
        'Authorization': f"Bearer {authenticated_user['token']}",
        'Content-Type': 'application/json'
    }

@pytest.fixture
def sample_cover_letter_data():
    """Provide sample cover letter data for testing."""
    return {
        'personalInfo': {
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone': '(555) 123-4567',
            'address': '123 Main St, City, State 12345'
        },
        'jobInfo': {
            'company': 'Test Company',
            'position': 'Software Engineer',
            'hiringManager': 'Jane Smith'
        },
        'content': {
            'introduction': 'I am writing to express my interest...',
            'body': 'With my experience in...',
            'conclusion': 'Thank you for considering...'
        }
    }

@pytest.fixture
def sample_job_application():
    """Provide sample job application data for testing."""
    return {
        'company': 'Google',
        'position': 'Software Engineer',
        'location': 'Mountain View, CA',
        'salary': '$120,000 - $150,000',
        'jobUrl': 'https://careers.google.com/jobs/123',
        'status': 'applied',
        'dateApplied': '2024-01-15',
        'followUpDate': '2024-01-22',
        'notes': 'Submitted through company website',
        'contactPerson': 'John Smith',
        'contactEmail': 'john.smith@google.com'
    }

@pytest.fixture
def sample_resume_data():
    """Provide sample resume data for testing."""
    return {
        'personalInfo': {
            'fullName': 'John Doe',
            'email': 'john@example.com',
            'phone': '(555) 123-4567',
            'address': '123 Main St, City, State',
            'linkedin': 'https://linkedin.com/in/johndoe',
            'website': 'https://johndoe.dev',
            'summary': 'Experienced software engineer...'
        },
        'experience': [
            {
                'company': 'Tech Corp',
                'position': 'Senior Developer',
                'startDate': '2022-01',
                'endDate': '2024-01',
                'isCurrent': False,
                'description': 'Led development of web applications...'
            }
        ],
        'education': [
            {
                'institution': 'University of Technology',
                'degree': 'Bachelor of Science',
                'fieldOfStudy': 'Computer Science',
                'startDate': '2018-09',
                'endDate': '2022-05',
                'gpa': '3.8'
            }
        ],
        'skills': [
            {
                'name': 'JavaScript',
                'category': 'Technical',
                'proficiency': 'Advanced'
            }
        ],
        'projects': [
            {
                'name': 'E-commerce Platform',
                'description': 'Built a full-stack e-commerce application...',
                'technologies': 'React, Node.js, MongoDB',
                'url': 'https://github.com/johndoe/ecommerce',
                'startDate': '2023-01',
                'endDate': '2023-06'
            }
        ],
        'certifications': [
            {
                'name': 'AWS Certified Developer',
                'issuer': 'Amazon Web Services',
                'dateEarned': '2023-08',
                'expiryDate': '2026-08',
                'credentialUrl': 'https://aws.amazon.com/certification/verify/12345'
            }
        ],
        'templateName': 'modern'
    } 