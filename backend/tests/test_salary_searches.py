import pytest
import json

def test_get_salary_searches_empty(client, auth_headers):
    """Test getting salary searches when none exist."""
    response = client.get('/api/salary-searches', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'searches' in data
    assert data['searches'] == []

def test_save_salary_search_success(client, auth_headers):
    """Test successfully saving salary search data."""
    search_data = {
        'jobTitle': 'Software Engineer',
        'location': 'San Francisco, CA',
        'experience': '3-5',
        'salaryRange': {
            'min': 120000,
            'max': 180000,
            'average': 150000
        },
        'marketData': {
            'percentile25': 130000,
            'percentile50': 150000,
            'percentile75': 170000,
            'percentile90': 190000,
            'totalCompensation': 180000
        },
        'sources': ['Glassdoor', 'LinkedIn', 'PayScale']
    }
    
    response = client.post('/api/salary-searches', 
                          headers=auth_headers,
                          json=search_data)
    data = response.get_json()
    
    assert response.status_code == 201
    assert 'message' in data
    assert 'saved successfully' in data['message']

def test_get_salary_searches_after_save(client, auth_headers):
    """Test retrieving salary searches after saving."""
    # Save multiple searches
    searches = [
        {
            'jobTitle': 'Frontend Developer',
            'location': 'New York, NY',
            'experience': '2-4',
            'salaryRange': {'min': 90000, 'max': 140000, 'average': 115000},
            'marketData': {'percentile50': 115000, 'totalCompensation': 130000}
        },
        {
            'jobTitle': 'Backend Developer',
            'location': 'Seattle, WA',
            'experience': '5-7',
            'salaryRange': {'min': 130000, 'max': 190000, 'average': 160000},
            'marketData': {'percentile50': 160000, 'totalCompensation': 180000}
        }
    ]
    
    for search in searches:
        client.post('/api/salary-searches', 
                   headers=auth_headers,
                   json=search)
    
    # Retrieve searches
    response = client.get('/api/salary-searches', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'searches' in data
    assert len(data['searches']) == 2
    
    job_titles = [search['jobTitle'] for search in data['searches']]
    assert 'Frontend Developer' in job_titles
    assert 'Backend Developer' in job_titles

def test_save_salary_search_missing_fields(client, auth_headers):
    """Test saving salary search with missing required fields."""
    incomplete_data = {
        'jobTitle': 'Developer'
        # Missing location, experience, salary data
    }
    
    response = client.post('/api/salary-searches', 
                          headers=auth_headers,
                          json=incomplete_data)
    data = response.get_json()
    
    assert response.status_code == 400
    assert 'message' in data

def test_salary_searches_user_isolation(client, test_user_data):
    """Test that users can only access their own salary searches."""
    # Create first user and save search
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
    
    # Save search for user1
    search_data = {
        'jobTitle': 'User 1 Job',
        'location': 'User 1 Location',
        'experience': '3-5',
        'salaryRange': {'min': 100000, 'max': 150000, 'average': 125000},
        'marketData': {'percentile50': 125000}
    }
    
    client.post('/api/salary-searches', 
                headers=user1_headers,
                json=search_data)
    
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
    
    # User2 should not see user1's searches
    response = client.get('/api/salary-searches', headers=user2_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert data['searches'] == []  # Should be empty for user2

def test_delete_salary_searches_success(client, auth_headers):
    """Test successfully deleting salary search history."""
    # Save some searches first
    searches = [
        {
            'jobTitle': 'Data Scientist',
            'location': 'Austin, TX',
            'experience': '4-6',
            'salaryRange': {'min': 110000, 'max': 160000, 'average': 135000},
            'marketData': {'percentile50': 135000}
        },
        {
            'jobTitle': 'DevOps Engineer',
            'location': 'Denver, CO',
            'experience': '5-8',
            'salaryRange': {'min': 120000, 'max': 170000, 'average': 145000},
            'marketData': {'percentile50': 145000}
        }
    ]
    
    for search in searches:
        client.post('/api/salary-searches', 
                   headers=auth_headers,
                   json=search)
    
    # Verify searches exist
    get_response = client.get('/api/salary-searches', headers=auth_headers)
    assert len(get_response.get_json()['searches']) == 2
    
    # Delete history
    response = client.delete('/api/salary-searches', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'message' in data
    assert 'cleared successfully' in data['message']
    
    # Verify history is empty
    get_response = client.get('/api/salary-searches', headers=auth_headers)
    assert get_response.get_json()['searches'] == []

def test_salary_searches_unauthorized_access(client):
    """Test accessing salary search endpoints without authentication."""
    search_data = {
        'jobTitle': 'Engineer',
        'location': 'City',
        'experience': '3-5',
        'salaryRange': {'min': 100000, 'max': 150000, 'average': 125000}
    }
    
    # Test GET without auth
    response = client.get('/api/salary-searches')
    assert response.status_code == 401
    
    # Test POST without auth
    response = client.post('/api/salary-searches', json=search_data)
    assert response.status_code == 401
    
    # Test DELETE without auth
    response = client.delete('/api/salary-searches')
    assert response.status_code == 401

def test_save_salary_search_with_detailed_market_data(client, auth_headers):
    """Test saving salary search with comprehensive market data."""
    detailed_search = {
        'jobTitle': 'Senior Software Engineer',
        'location': 'Silicon Valley, CA',
        'experience': '7-10',
        'companySize': 'Large (1000+ employees)',
        'industry': 'Technology',
        'salaryRange': {
            'min': 160000,
            'max': 250000,
            'average': 205000,
            'median': 200000
        },
        'marketData': {
            'percentile10': 140000,
            'percentile25': 175000,
            'percentile50': 200000,
            'percentile75': 230000,
            'percentile90': 250000,
            'totalCompensation': 280000,
            'baseSalary': 200000,
            'bonus': 40000,
            'equity': 40000
        },
        'sources': ['Glassdoor', 'LinkedIn', 'Levels.fyi', 'PayScale'],
        'benefits': ['Health Insurance', '401k Match', 'Stock Options', 'Remote Work'],
        'lastUpdated': '2024-01-15'
    }
    
    response = client.post('/api/salary-searches', 
                          headers=auth_headers,
                          json=detailed_search)
    
    assert response.status_code == 201
    
    # Verify detailed data is saved
    get_response = client.get('/api/salary-searches', headers=auth_headers)
    searches = get_response.get_json()['searches']
    
    assert len(searches) == 1
    saved_search = searches[0]
    
    assert saved_search['jobTitle'] == 'Senior Software Engineer'
    assert saved_search['experience'] == '7-10'
    assert saved_search['marketData']['totalCompensation'] == 280000
    assert 'Health Insurance' in saved_search.get('benefits', [])

def test_salary_search_with_multiple_locations(client, auth_headers):
    """Test saving salary searches for same job in different locations."""
    job_title = 'Product Manager'
    locations = [
        ('San Francisco, CA', 140000),
        ('New York, NY', 130000),
        ('Austin, TX', 110000),
        ('Remote', 120000)
    ]
    
    for location, avg_salary in locations:
        search_data = {
            'jobTitle': job_title,
            'location': location,
            'experience': '5-7',
            'salaryRange': {
                'min': avg_salary - 20000,
                'max': avg_salary + 30000,
                'average': avg_salary
            },
            'marketData': {'percentile50': avg_salary}
        }
        
        response = client.post('/api/salary-searches', 
                              headers=auth_headers,
                              json=search_data)
        assert response.status_code == 201
    
    # Verify all location searches are saved
    get_response = client.get('/api/salary-searches', headers=auth_headers)
    searches = get_response.get_json()['searches']
    
    assert len(searches) == 4
    saved_locations = [search['location'] for search in searches]
    
    for location, _ in locations:
        assert location in saved_locations

def test_salary_search_with_timestamps(client, auth_headers):
    """Test that salary searches are saved with proper timestamps."""
    search_data = {
        'jobTitle': 'UX Designer',
        'location': 'Portland, OR',
        'experience': '3-5',
        'salaryRange': {'min': 80000, 'max': 120000, 'average': 100000},
        'marketData': {'percentile50': 100000}
    }
    
    response = client.post('/api/salary-searches', 
                          headers=auth_headers,
                          json=search_data)
    assert response.status_code == 201
    
    # Get the search and check timestamp
    get_response = client.get('/api/salary-searches', headers=auth_headers)
    searches = get_response.get_json()['searches']
    
    assert len(searches) == 1
    assert 'savedDate' in searches[0]
    # Should have a valid ISO timestamp format
    assert 'T' in searches[0]['savedDate']

def test_salary_search_edge_cases(client, auth_headers):
    """Test edge cases for salary searches."""
    # Test with very high salary
    high_salary_search = {
        'jobTitle': 'VP of Engineering',
        'location': 'San Francisco, CA',
        'experience': '15+',
        'salaryRange': {'min': 300000, 'max': 500000, 'average': 400000},
        'marketData': {'percentile50': 400000, 'totalCompensation': 800000}
    }
    
    response = client.post('/api/salary-searches', 
                          headers=auth_headers,
                          json=high_salary_search)
    assert response.status_code == 201
    
    # Test with entry-level salary
    entry_level_search = {
        'jobTitle': 'Junior Developer',
        'location': 'Small City, USA',
        'experience': '0-1',
        'salaryRange': {'min': 45000, 'max': 65000, 'average': 55000},
        'marketData': {'percentile50': 55000}
    }
    
    response = client.post('/api/salary-searches', 
                          headers=auth_headers,
                          json=entry_level_search)
    assert response.status_code == 201
    
    # Verify both searches are saved
    get_response = client.get('/api/salary-searches', headers=auth_headers)
    searches = get_response.get_json()['searches']
    
    assert len(searches) == 2
    avg_salaries = [search['salaryRange']['average'] for search in searches]
    assert 400000 in avg_salaries
    assert 55000 in avg_salaries 