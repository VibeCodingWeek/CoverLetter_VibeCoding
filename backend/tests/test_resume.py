import pytest
import json

def test_get_resume_empty(client, auth_headers):
    """Test getting resume data when none exists."""
    response = client.get('/api/resume', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'data' in data
    assert data['data'] == {}

def test_save_resume_success(client, auth_headers, sample_resume_data):
    """Test successfully saving resume data."""
    response = client.post('/api/resume', 
                          headers=auth_headers,
                          json=sample_resume_data)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'message' in data
    assert 'saved successfully' in data['message']

def test_get_resume_after_save(client, auth_headers, sample_resume_data):
    """Test retrieving resume data after saving."""
    # Save data first
    client.post('/api/resume', 
                headers=auth_headers,
                json=sample_resume_data)
    
    # Retrieve data
    response = client.get('/api/resume', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'data' in data
    assert data['data']['personalInfo']['fullName'] == sample_resume_data['personalInfo']['fullName']
    assert data['data']['templateName'] == sample_resume_data['templateName']

def test_update_resume_data(client, auth_headers, sample_resume_data):
    """Test updating existing resume data."""
    # Save initial data
    client.post('/api/resume', 
                headers=auth_headers,
                json=sample_resume_data)
    
    # Update data
    updated_data = sample_resume_data.copy()
    updated_data['personalInfo']['fullName'] = 'Jane Smith'
    updated_data['templateName'] = 'classic'
    
    response = client.post('/api/resume', 
                          headers=auth_headers,
                          json=updated_data)
    
    assert response.status_code == 200
    
    # Verify data was updated
    get_response = client.get('/api/resume', headers=auth_headers)
    get_data = get_response.get_json()
    
    assert get_data['data']['personalInfo']['fullName'] == 'Jane Smith'
    assert get_data['data']['templateName'] == 'classic'

def test_resume_with_experience_data(client, auth_headers):
    """Test saving resume with experience entries."""
    resume_data = {
        'personalInfo': {
            'fullName': 'John Doe',
            'email': 'john@example.com'
        },
        'experience': [
            {
                'company': 'Tech Corp',
                'position': 'Developer',
                'startDate': '2022-01',
                'endDate': '2024-01',
                'isCurrent': False,
                'description': 'Developed web applications'
            },
            {
                'company': 'Startup Inc',
                'position': 'Senior Developer',
                'startDate': '2024-02',
                'endDate': '',
                'isCurrent': True,
                'description': 'Leading development team'
            }
        ]
    }
    
    response = client.post('/api/resume', 
                          headers=auth_headers,
                          json=resume_data)
    
    assert response.status_code == 200
    
    # Verify experience data is saved
    get_response = client.get('/api/resume', headers=auth_headers)
    get_data = get_response.get_json()
    
    assert len(get_data['data']['experience']) == 2
    assert get_data['data']['experience'][0]['company'] == 'Tech Corp'
    assert get_data['data']['experience'][1]['isCurrent'] == True

def test_resume_unauthorized_access(client, sample_resume_data):
    """Test accessing resume endpoints without authentication."""
    # Test GET without auth
    response = client.get('/api/resume')
    assert response.status_code == 401
    
    # Test POST without auth
    response = client.post('/api/resume', json=sample_resume_data)
    assert response.status_code == 401

def test_resume_user_isolation(client, test_user_data, sample_resume_data):
    """Test that users can only access their own resume data."""
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
    client.post('/api/resume', 
                headers=user1_headers,
                json=sample_resume_data)
    
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
    response = client.get('/api/resume', headers=user2_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert data['data'] == {}  # Should be empty for user2

def test_resume_with_complex_structure(client, auth_headers):
    """Test saving resume with all sections filled."""
    complex_resume = {
        'personalInfo': {
            'fullName': 'Alice Johnson',
            'email': 'alice@example.com',
            'phone': '(555) 123-4567',
            'address': '123 Main St, City, State',
            'linkedin': 'linkedin.com/in/alice',
            'website': 'alicejohnson.dev',
            'summary': 'Experienced software engineer with 5+ years...'
        },
        'experience': [
            {
                'company': 'Big Tech Corp',
                'position': 'Senior Software Engineer',
                'startDate': '2020-01',
                'endDate': '2024-01',
                'isCurrent': False,
                'description': 'Led development of microservices architecture'
            }
        ],
        'education': [
            {
                'institution': 'University of Technology',
                'degree': 'Bachelor of Science',
                'fieldOfStudy': 'Computer Science',
                'startDate': '2016-09',
                'endDate': '2020-05',
                'gpa': '3.8'
            }
        ],
        'skills': [
            {
                'name': 'JavaScript',
                'category': 'Technical',
                'proficiency': 'Expert'
            },
            {
                'name': 'Leadership',
                'category': 'Soft Skills',
                'proficiency': 'Advanced'
            }
        ],
        'projects': [
            {
                'name': 'E-commerce Platform',
                'description': 'Built scalable e-commerce solution',
                'technologies': 'React, Node.js, MongoDB',
                'url': 'github.com/alice/ecommerce',
                'startDate': '2023-01',
                'endDate': '2023-06'
            }
        ],
        'certifications': [
            {
                'name': 'AWS Solutions Architect',
                'issuer': 'Amazon Web Services',
                'dateEarned': '2023-03',
                'expiryDate': '2026-03',
                'credentialUrl': 'aws.amazon.com/verification/12345'
            }
        ],
        'templateName': 'professional'
    }
    
    response = client.post('/api/resume', 
                          headers=auth_headers,
                          json=complex_resume)
    
    assert response.status_code == 200
    
    # Verify all sections are saved
    get_response = client.get('/api/resume', headers=auth_headers)
    get_data = get_response.get_json()
    saved_resume = get_data['data']
    
    assert saved_resume['personalInfo']['fullName'] == 'Alice Johnson'
    assert len(saved_resume['experience']) == 1
    assert len(saved_resume['education']) == 1
    assert len(saved_resume['skills']) == 2
    assert len(saved_resume['projects']) == 1
    assert len(saved_resume['certifications']) == 1
    assert saved_resume['templateName'] == 'professional'

def test_resume_partial_updates(client, auth_headers, sample_resume_data):
    """Test partial updates to resume data."""
    # Save initial data
    client.post('/api/resume', 
                headers=auth_headers,
                json=sample_resume_data)
    
    # Update only personal info
    partial_update = {
        'personalInfo': {
            'fullName': 'Updated Name',
            'email': 'updated@example.com'
        }
    }
    
    response = client.post('/api/resume', 
                          headers=auth_headers,
                          json=partial_update)
    
    assert response.status_code == 200
    
    # Verify partial update worked
    get_response = client.get('/api/resume', headers=auth_headers)
    get_data = get_response.get_json()
    
    assert get_data['data']['personalInfo']['fullName'] == 'Updated Name'
    assert get_data['data']['personalInfo']['email'] == 'updated@example.com'

def test_resume_empty_sections(client, auth_headers):
    """Test saving resume with empty sections."""
    empty_resume = {
        'personalInfo': {
            'fullName': 'Test User',
            'email': 'test@example.com'
        },
        'experience': [],
        'education': [],
        'skills': [],
        'projects': [],
        'certifications': []
    }
    
    response = client.post('/api/resume', 
                          headers=auth_headers,
                          json=empty_resume)
    
    assert response.status_code == 200
    
    get_response = client.get('/api/resume', headers=auth_headers)
    get_data = get_response.get_json()
    
    assert get_data['data']['personalInfo']['fullName'] == 'Test User'
    assert get_data['data']['experience'] == []
    assert get_data['data']['skills'] == [] 