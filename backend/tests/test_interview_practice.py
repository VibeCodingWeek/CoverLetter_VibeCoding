import pytest
import json

def test_get_interview_history_empty(client, auth_headers):
    """Test getting interview practice history when none exists."""
    response = client.get('/api/interview-practice', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'history' in data
    assert data['history'] == []

def test_save_interview_session_success(client, auth_headers):
    """Test successfully saving interview practice session."""
    session_data = {
        'category': 'behavioral',
        'question': 'Tell me about a time when you overcame a challenge.',
        'userAnswer': 'In my previous role, I faced a significant challenge when...',
        'timeTaken': 180,
        'difficulty': 'medium'
    }
    
    response = client.post('/api/interview-practice', 
                          headers=auth_headers,
                          json=session_data)
    data = response.get_json()
    
    assert response.status_code == 201
    assert 'message' in data
    assert 'saved successfully' in data['message']

def test_get_interview_history_after_save(client, auth_headers):
    """Test retrieving interview history after saving sessions."""
    # Save multiple sessions
    sessions = [
        {
            'category': 'behavioral',
            'question': 'Tell me about yourself.',
            'userAnswer': 'I am a software developer with...',
            'timeTaken': 120,
            'difficulty': 'easy'
        },
        {
            'category': 'technical',
            'question': 'Explain the difference between REST and GraphQL.',
            'userAnswer': 'REST is an architectural style...',
            'timeTaken': 200,
            'difficulty': 'medium'
        }
    ]
    
    for session in sessions:
        client.post('/api/interview-practice', 
                   headers=auth_headers,
                   json=session)
    
    # Retrieve history
    response = client.get('/api/interview-practice', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'history' in data
    assert len(data['history']) == 2
    assert data['history'][0]['category'] in ['behavioral', 'technical']
    assert data['history'][1]['category'] in ['behavioral', 'technical']

def test_save_interview_session_missing_fields(client, auth_headers):
    """Test saving interview session with missing required fields."""
    incomplete_data = {
        'category': 'behavioral'
        # Missing question, userAnswer, timeTaken
    }
    
    response = client.post('/api/interview-practice', 
                          headers=auth_headers,
                          json=incomplete_data)
    data = response.get_json()
    
    assert response.status_code == 400
    assert 'message' in data

def test_save_interview_session_with_long_answer(client, auth_headers):
    """Test saving interview session with very long answer."""
    long_answer = "This is a very long answer. " * 100  # 2700+ characters
    
    session_data = {
        'category': 'behavioral',
        'question': 'Tell me about a complex project you worked on.',
        'userAnswer': long_answer,
        'timeTaken': 300,
        'difficulty': 'hard'
    }
    
    response = client.post('/api/interview-practice', 
                          headers=auth_headers,
                          json=session_data)
    
    assert response.status_code == 201
    
    # Verify long answer is saved
    get_response = client.get('/api/interview-practice', headers=auth_headers)
    get_data = get_response.get_json()
    
    assert len(get_data['history']) == 1
    assert len(get_data['history'][0]['userAnswer']) > 2000

def test_interview_practice_user_isolation(client, test_user_data):
    """Test that users can only access their own interview practice data."""
    # Create first user and save session
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
    
    # Save session for user1
    session_data = {
        'category': 'behavioral',
        'question': 'User 1 question',
        'userAnswer': 'User 1 answer',
        'timeTaken': 120
    }
    
    client.post('/api/interview-practice', 
                headers=user1_headers,
                json=session_data)
    
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
    
    # User2 should not see user1's sessions
    response = client.get('/api/interview-practice', headers=user2_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert data['history'] == []  # Should be empty for user2

def test_delete_interview_history_success(client, auth_headers):
    """Test successfully deleting interview practice history."""
    # Save some sessions first
    sessions = [
        {
            'category': 'behavioral',
            'question': 'Question 1',
            'userAnswer': 'Answer 1',
            'timeTaken': 120
        },
        {
            'category': 'technical',
            'question': 'Question 2',
            'userAnswer': 'Answer 2',
            'timeTaken': 180
        }
    ]
    
    for session in sessions:
        client.post('/api/interview-practice', 
                   headers=auth_headers,
                   json=session)
    
    # Verify sessions exist
    get_response = client.get('/api/interview-practice', headers=auth_headers)
    assert len(get_response.get_json()['history']) == 2
    
    # Delete history
    response = client.delete('/api/interview-practice', headers=auth_headers)
    data = response.get_json()
    
    assert response.status_code == 200
    assert 'message' in data
    assert 'cleared successfully' in data['message']
    
    # Verify history is empty
    get_response = client.get('/api/interview-practice', headers=auth_headers)
    assert get_response.get_json()['history'] == []

def test_interview_practice_unauthorized_access(client):
    """Test accessing interview practice endpoints without authentication."""
    session_data = {
        'category': 'behavioral',
        'question': 'Test question',
        'userAnswer': 'Test answer',
        'timeTaken': 120
    }
    
    # Test GET without auth
    response = client.get('/api/interview-practice')
    assert response.status_code == 401
    
    # Test POST without auth
    response = client.post('/api/interview-practice', json=session_data)
    assert response.status_code == 401
    
    # Test DELETE without auth
    response = client.delete('/api/interview-practice')
    assert response.status_code == 401

def test_save_interview_session_different_categories(client, auth_headers):
    """Test saving interview sessions for different categories."""
    categories = ['behavioral', 'technical', 'situational', 'company-specific']
    
    for i, category in enumerate(categories):
        session_data = {
            'category': category,
            'question': f'Question for {category} category',
            'userAnswer': f'Answer for {category} question',
            'timeTaken': 120 + (i * 30),
            'difficulty': ['easy', 'medium', 'hard'][i % 3]
        }
        
        response = client.post('/api/interview-practice', 
                              headers=auth_headers,
                              json=session_data)
        assert response.status_code == 201
    
    # Verify all categories are saved
    get_response = client.get('/api/interview-practice', headers=auth_headers)
    history = get_response.get_json()['history']
    
    assert len(history) == 4
    saved_categories = [session['category'] for session in history]
    
    for category in categories:
        assert category in saved_categories

def test_interview_practice_with_timestamps(client, auth_headers):
    """Test that interview sessions are saved with proper timestamps."""
    session_data = {
        'category': 'behavioral',
        'question': 'Tell me about your greatest achievement.',
        'userAnswer': 'My greatest achievement was...',
        'timeTaken': 150
    }
    
    response = client.post('/api/interview-practice', 
                          headers=auth_headers,
                          json=session_data)
    assert response.status_code == 201
    
    # Get the session and check timestamp
    get_response = client.get('/api/interview-practice', headers=auth_headers)
    history = get_response.get_json()['history']
    
    assert len(history) == 1
    assert 'sessionDate' in history[0]
    # Should have a valid ISO timestamp format
    assert 'T' in history[0]['sessionDate']

def test_interview_practice_edge_cases(client, auth_headers):
    """Test edge cases for interview practice."""
    # Test with very short answer
    short_session = {
        'category': 'behavioral',
        'question': 'Why do you want this job?',
        'userAnswer': 'Yes.',
        'timeTaken': 5
    }
    
    response = client.post('/api/interview-practice', 
                          headers=auth_headers,
                          json=short_session)
    assert response.status_code == 201
    
    # Test with very long time
    long_time_session = {
        'category': 'technical',
        'question': 'Explain database normalization.',
        'userAnswer': 'Database normalization is a process...',
        'timeTaken': 1800  # 30 minutes
    }
    
    response = client.post('/api/interview-practice', 
                          headers=auth_headers,
                          json=long_time_session)
    assert response.status_code == 201
    
    # Verify both sessions are saved
    get_response = client.get('/api/interview-practice', headers=auth_headers)
    history = get_response.get_json()['history']
    
    assert len(history) == 2
    time_taken_values = [session['timeTaken'] for session in history]
    assert 5 in time_taken_values
    assert 1800 in time_taken_values 