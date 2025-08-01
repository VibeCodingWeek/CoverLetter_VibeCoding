import pytest
import json

def test_get_job_applications_empty(client, auth_headers):
    """Test getting job applications when none exist."""
    response = client.get('/api/job-applications', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'applications' in data
    assert data['applications'] == []

def test_create_job_application_success(client, auth_headers, sample_job_application):
    """Test successfully creating a job application."""
    response = client.post('/api/job-applications', 
                          headers=auth_headers,
                          json=sample_job_application)
    data = response.get_json()
    
    assert response.status_code == 201
    assert 'id' in data
    assert 'message' in data
    assert 'created successfully' in data['message']

def test_create_job_application_missing_required_fields(client, auth_headers):
    """Test creating job application with missing required fields."""
    incomplete_data = {
        'company': 'Test Company'
        # Missing position
    }
    
    response = client.post('/api/job-applications', 
                          headers=auth_headers,
                          json=incomplete_data)
    data = response.get_json()
    
    assert response.status_code == 400
    assert 'Company and position are required' in data['message']

def test_get_job_applications_after_create(client, auth_headers, sample_job_application):
    """Test retrieving job applications after creating one."""
    # Create application
    create_response = client.post('/api/job-applications', 
                                 headers=auth_headers,
                                 json=sample_job_application)
    application_id = create_response.get_json()['id']
    
    # Get all applications
    response = client.get('/api/job-applications', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert len(data['applications']) == 1
    assert data['applications'][0]['id'] == application_id
    assert data['applications'][0]['company'] == sample_job_application['company']
    assert data['applications'][0]['position'] == sample_job_application['position']

def test_update_job_application_success(client, auth_headers, sample_job_application):
    """Test successfully updating a job application."""
    # Create application
    create_response = client.post('/api/job-applications', 
                                 headers=auth_headers,
                                 json=sample_job_application)
    application_id = create_response.get_json()['id']
    
    # Update application
    updated_data = sample_job_application.copy()
    updated_data['company'] = 'Updated Company'
    updated_data['status'] = 'interview'
    
    response = client.put(f'/api/job-applications/{application_id}', 
                         headers=auth_headers,
                         json=updated_data)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'message' in data
    assert 'updated successfully' in data['message']
    
    # Verify update
    get_response = client.get('/api/job-applications', headers=auth_headers)
    applications = get_response.get_json()['applications']
    updated_app = next(app for app in applications if app['id'] == application_id)
    
    assert updated_app['company'] == 'Updated Company'
    assert updated_app['status'] == 'interview'

def test_update_nonexistent_job_application(client, auth_headers, sample_job_application):
    """Test updating a job application that doesn't exist."""
    response = client.put('/api/job-applications/99999', 
                         headers=auth_headers,
                         json=sample_job_application)
    data = response.get_json()
    
    assert response.status_code == 404
    assert 'Job application not found' in data['message']

def test_delete_job_application_success(client, auth_headers, sample_job_application):
    """Test successfully deleting a job application."""
    # Create application
    create_response = client.post('/api/job-applications', 
                                 headers=auth_headers,
                                 json=sample_job_application)
    application_id = create_response.get_json()['id']
    
    # Delete application
    response = client.delete(f'/api/job-applications/{application_id}', 
                            headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'message' in data
    assert 'deleted successfully' in data['message']
    
    # Verify deletion
    get_response = client.get('/api/job-applications', headers=auth_headers)
    applications = get_response.get_json()['applications']
    
    assert len(applications) == 0

def test_delete_nonexistent_job_application(client, auth_headers):
    """Test deleting a job application that doesn't exist."""
    response = client.delete('/api/job-applications/99999', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 404
    assert 'Job application not found' in data['message']

def test_job_applications_user_isolation(client, test_user_data, sample_job_application):
    """Test that users can only access their own job applications."""
    # Create first user and application
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
    
    # Create application for user1
    create_response = client.post('/api/job-applications', 
                                 headers=user1_headers,
                                 json=sample_job_application)
    application_id = create_response.get_json()['id']
    
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
    
    # User2 should not see user1's applications
    response = client.get('/api/job-applications', headers=user2_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert data['applications'] == []
    
    # User2 should not be able to update user1's application
    updated_data = sample_job_application.copy()
    updated_data['company'] = 'Hacked Company'
    
    update_response = client.put(f'/api/job-applications/{application_id}', 
                               headers=user2_headers,
                               json=updated_data)
    
    assert update_response.status_code == 404

def test_create_multiple_job_applications(client, auth_headers, sample_job_application):
    """Test creating multiple job applications."""
    applications_data = [
        {**sample_job_application, 'company': 'Company 1'},
        {**sample_job_application, 'company': 'Company 2'},
        {**sample_job_application, 'company': 'Company 3'}
    ]
    
    # Create multiple applications
    for app_data in applications_data:
        response = client.post('/api/job-applications', 
                              headers=auth_headers,
                              json=app_data)
        assert response.status_code == 201
    
    # Verify all applications exist
    response = client.get('/api/job-applications', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert len(data['applications']) == 3
    
    companies = [app['company'] for app in data['applications']]
    assert 'Company 1' in companies
    assert 'Company 2' in companies
    assert 'Company 3' in companies

def test_job_applications_unauthorized_access(client, sample_job_application):
    """Test accessing job applications endpoints without authentication."""
    # Test GET without auth
    response = client.get('/api/job-applications')
    assert response.status_code == 401
    
    # Test POST without auth
    response = client.post('/api/job-applications', json=sample_job_application)
    assert response.status_code == 401
    
    # Test PUT without auth
    response = client.put('/api/job-applications/1', json=sample_job_application)
    assert response.status_code == 401
    
    # Test DELETE without auth
    response = client.delete('/api/job-applications/1')
    assert response.status_code == 401

def test_job_application_with_optional_fields(client, auth_headers):
    """Test creating job application with only required fields."""
    minimal_data = {
        'company': 'Minimal Company',
        'position': 'Developer'
    }
    
    response = client.post('/api/job-applications', 
                          headers=auth_headers,
                          json=minimal_data)
    data = response.get_json()
    
    assert response.status_code == 201
    assert 'id' in data
    
    # Verify defaults are set
    get_response = client.get('/api/job-applications', headers=auth_headers)
    applications = get_response.get_json()['applications']
    created_app = applications[0]
    
    assert created_app['company'] == 'Minimal Company'
    assert created_app['position'] == 'Developer'
    assert created_app['status'] == 'applied'  # Default status 