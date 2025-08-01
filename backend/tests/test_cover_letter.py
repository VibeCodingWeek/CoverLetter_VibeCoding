import pytest
import json

def test_get_cover_letter_empty(client, auth_headers):
    """Test getting cover letter data when none exists."""
    response = client.get('/api/cover-letter', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'coverLetterData' in data
    assert data['coverLetterData'] == {}

def test_save_cover_letter_success(client, auth_headers, sample_cover_letter_data):
    """Test successfully saving cover letter data."""
    response = client.post('/api/cover-letter', 
                          headers=auth_headers,
                          json=sample_cover_letter_data)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'message' in data
    assert 'saved successfully' in data['message']

def test_get_cover_letter_after_save(client, auth_headers, sample_cover_letter_data):
    """Test retrieving cover letter data after saving."""
    # Save data first
    client.post('/api/cover-letter', 
                headers=auth_headers,
                json=sample_cover_letter_data)
    
    # Retrieve data
    response = client.get('/api/cover-letter', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'coverLetterData' in data
    assert data['coverLetterData']['personalInfo']['name'] == sample_cover_letter_data['personalInfo']['name']
    assert data['coverLetterData']['jobInfo']['company'] == sample_cover_letter_data['jobInfo']['company']

def test_update_cover_letter_data(client, auth_headers, sample_cover_letter_data):
    """Test updating existing cover letter data."""
    # Save initial data
    client.post('/api/cover-letter', 
                headers=auth_headers,
                json=sample_cover_letter_data)
    
    # Update data
    updated_data = sample_cover_letter_data.copy()
    updated_data['personalInfo']['name'] = 'Jane Doe'
    updated_data['jobInfo']['company'] = 'Updated Company'
    
    response = client.post('/api/cover-letter', 
                          headers=auth_headers,
                          json=updated_data)
    
    assert response.status_code == 200
    
    # Verify data was updated
    get_response = client.get('/api/cover-letter', headers=auth_headers)
    get_data = get_response.get_json()
    
    assert get_data['coverLetterData']['personalInfo']['name'] == 'Jane Doe'
    assert get_data['coverLetterData']['jobInfo']['company'] == 'Updated Company'

def test_save_cover_letter_invalid_data(client, auth_headers):
    """Test saving cover letter with invalid data structure."""
    invalid_data = {
        'invalid_field': 'invalid_value'
    }
    
    response = client.post('/api/cover-letter', 
                          headers=auth_headers,
                          json=invalid_data)
    
    # Should still save (our API is permissive)
    assert response.status_code == 200

def test_save_cover_letter_empty_data(client, auth_headers):
    """Test saving empty cover letter data."""
    empty_data = {}
    
    response = client.post('/api/cover-letter', 
                          headers=auth_headers,
                          json=empty_data)
    
    assert response.status_code == 200

def test_cover_letter_unauthorized_access(client, sample_cover_letter_data):
    """Test accessing cover letter endpoints without authentication."""
    # Test GET without auth
    response = client.get('/api/cover-letter')
    assert response.status_code == 401
    
    # Test POST without auth
    response = client.post('/api/cover-letter', json=sample_cover_letter_data)
    assert response.status_code == 401

def test_cover_letter_user_isolation(client, test_user_data, sample_cover_letter_data):
    """Test that users can only access their own cover letter data."""
    # Create first user and save data
    client.post('/api/signup', json=test_user_data)
    login_response = client.post('/api/login', json={
        'email': test_user_data['email'],
        'password': test_user_data['password']
    })
    user1_token = login_response.get_json()['token']
    user1_headers = {
        'Authorization': f"Bearer {user1_token}",
        'Content-Type': 'application/json'
    }
    
    # Save data for user1
    client.post('/api/cover-letter', 
                headers=user1_headers,
                json=sample_cover_letter_data)
    
    # Create second user
    user2_data = {
        'username': 'testuser2',
        'email': 'test2@example.com',
        'password': 'testpassword123'
    }
    client.post('/api/signup', json=user2_data)
    login_response2 = client.post('/api/login', json={
        'email': user2_data['email'],
        'password': user2_data['password']
    })
    user2_token = login_response2.get_json()['token']
    user2_headers = {
        'Authorization': f"Bearer {user2_token}",
        'Content-Type': 'application/json'
    }
    
    # User2 should not see user1's data
    response = client.get('/api/cover-letter', headers=user2_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert data['coverLetterData'] == {}  # Should be empty for user2

def test_cover_letter_malformed_json(client, auth_headers):
    """Test handling of malformed JSON data."""
    # This is handled at the Flask level, but we can test with None
    response = client.post('/api/cover-letter', 
                          headers=auth_headers,
                          json=None)
    
    # Flask will handle this gracefully
    assert response.status_code in [200, 400] 