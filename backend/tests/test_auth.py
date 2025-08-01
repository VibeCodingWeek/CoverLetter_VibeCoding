import pytest
import json
from werkzeug.security import check_password_hash

def test_signup_success(client, test_user_data):
    """Test successful user registration."""
    response = client.post('/api/signup', json=test_user_data)
    data = response.get_json()
    
    assert response.status_code == 201
    assert 'token' in data
    assert 'user' in data
    assert data['user']['username'] == test_user_data['username']
    assert data['user']['email'] == test_user_data['email']
    assert 'password' not in data['user']  # Password should not be returned

def test_signup_missing_fields(client):
    """Test user registration with missing required fields."""
    incomplete_data = {
        'username': 'testuser'
        # Missing email and password
    }
    
    response = client.post('/api/signup', json=incomplete_data)
    data = response.get_json()
    
    assert response.status_code == 400
    assert 'message' in data

def test_signup_invalid_email(client):
    """Test user registration with invalid email format."""
    invalid_data = {
        'username': 'testuser',
        'email': 'invalid-email',
        'password': 'password123'
    }
    
    response = client.post('/api/signup', json=invalid_data)
    data = response.get_json()
    
    assert response.status_code == 400
    assert 'Invalid email format' in data['message']

def test_signup_duplicate_email(client, test_user_data):
    """Test user registration with already existing email."""
    # Register user first time
    client.post('/api/signup', json=test_user_data)
    
    # Try to register again with same email
    response = client.post('/api/signup', json=test_user_data)
    data = response.get_json()
    
    assert response.status_code == 400
    assert 'Email already exists' in data['message']

def test_signup_duplicate_username(client, test_user_data):
    """Test user registration with already existing username."""
    # Register user first time
    client.post('/api/signup', json=test_user_data)
    
    # Try to register again with same username but different email
    duplicate_username_data = {
        'username': test_user_data['username'],
        'email': 'different@example.com',
        'password': 'password123'
    }
    
    response = client.post('/api/signup', json=duplicate_username_data)
    data = response.get_json()
    
    assert response.status_code == 400
    assert 'Username already exists' in data['message']

def test_login_success(client, test_user_data):
    """Test successful user login."""
    # Register user first
    client.post('/api/signup', json=test_user_data)
    
    # Login with correct credentials
    login_data = {
        'email': test_user_data['email'],
        'password': test_user_data['password']
    }
    
    response = client.post('/api/login', json=login_data)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'token' in data
    assert 'user' in data
    assert data['user']['email'] == test_user_data['email']

def test_login_invalid_credentials(client, test_user_data):
    """Test login with invalid credentials."""
    # Register user first
    client.post('/api/signup', json=test_user_data)
    
    # Try login with wrong password
    login_data = {
        'email': test_user_data['email'],
        'password': 'wrongpassword'
    }
    
    response = client.post('/api/login', json=login_data)
    data = response.get_json()
    
    assert response.status_code == 401
    assert 'Invalid email or password' in data['message']

def test_login_nonexistent_user(client):
    """Test login with non-existent user."""
    login_data = {
        'email': 'nonexistent@example.com',
        'password': 'password123'
    }
    
    response = client.post('/api/login', json=login_data)
    data = response.get_json()
    
    assert response.status_code == 401
    assert 'Invalid email or password' in data['message']

def test_login_missing_fields(client):
    """Test login with missing required fields."""
    incomplete_data = {
        'email': 'test@example.com'
        # Missing password
    }
    
    response = client.post('/api/login', json=incomplete_data)
    data = response.get_json()
    
    assert response.status_code == 400
    assert 'message' in data

def test_verify_token_valid(client, auth_headers):
    """Test token verification with valid token."""
    response = client.get('/api/verify-token', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'user' in data

def test_verify_token_invalid(client):
    """Test token verification with invalid token."""
    headers = {
        'Authorization': 'Bearer invalid-token',
        'Content-Type': 'application/json'
    }
    
    response = client.get('/api/verify-token', headers=headers)
    data = response.get_json()
    
    assert response.status_code == 401
    assert 'Invalid token' in data['message']

def test_verify_token_missing(client):
    """Test token verification with missing token."""
    response = client.get('/api/verify-token')
    data = response.get_json()
    
    assert response.status_code == 401
    assert 'Token is missing' in data['message']

def test_forgot_password_success(client, test_user_data):
    """Test successful forgot password request."""
    # Register user first
    client.post('/api/signup', json=test_user_data)
    
    # Request password reset
    forgot_data = {
        'email': test_user_data['email']
    }
    
    response = client.post('/api/forgot-password', json=forgot_data)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'username' in data
    assert data['username'] == test_user_data['username']

def test_forgot_password_nonexistent_user(client):
    """Test forgot password with non-existent user."""
    forgot_data = {
        'email': 'nonexistent@example.com'
    }
    
    response = client.post('/api/forgot-password', json=forgot_data)
    data = response.get_json()
    
    assert response.status_code == 404
    assert 'User not found' in data['message']

def test_reset_password_success(client, test_user_data):
    """Test successful password reset."""
    # Register user first
    client.post('/api/signup', json=test_user_data)
    
    # Reset password
    reset_data = {
        'email': test_user_data['email'],
        'newPassword': 'newpassword123'
    }
    
    response = client.post('/api/reset-password', json=reset_data)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'token' in data
    assert 'user' in data
    
    # Verify login with new password works
    login_response = client.post('/api/login', json={
        'email': test_user_data['email'],
        'password': 'newpassword123'
    })
    
    assert login_response.status_code == 200

def test_reset_password_nonexistent_user(client):
    """Test password reset with non-existent user."""
    reset_data = {
        'email': 'nonexistent@example.com',
        'newPassword': 'newpassword123'
    }
    
    response = client.post('/api/reset-password', json=reset_data)
    data = response.get_json()
    
    assert response.status_code == 404
    assert 'User not found' in data['message']

def test_protected_endpoint_without_auth(client):
    """Test accessing protected endpoint without authentication."""
    response = client.get('/api/cover-letter')
    data = response.get_json()
    
    assert response.status_code == 401
    assert 'Token is missing' in data['message'] 