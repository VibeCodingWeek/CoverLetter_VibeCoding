import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';

// Mock fetch globally
global.fetch = jest.fn();

// Test component to consume AuthContext
const TestComponent = () => {
  const { user, isAuthenticated, login, logout, authApi, dataApi } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? `Logged in as ${user?.username}` : 'Not logged in'}
      </div>
      <button onClick={() => authApi.login({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => authApi.signup({ username: 'testuser', email: 'test@example.com', password: 'password' })}>
        Signup
      </button>
      <button onClick={() => dataApi.coverLetter.get()}>
        Get Cover Letter
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    fetch.mockClear();
  });

  test('provides authentication context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in');
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
  });

  test('initializes authentication state from localStorage token', async () => {
    const mockToken = 'valid.jwt.token';
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as testuser');
    });

    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/verify-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json',
      },
    });
  });

  test('handles invalid token in localStorage', async () => {
    const mockToken = 'invalid.jwt.token';
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify({ username: 'testuser' }));
    
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in');
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  test('login function works correctly', async () => {
    const mockToken = 'new.jwt.token';
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken, user: mockUser }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await act(async () => {
      loginButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as testuser');
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
    });
  });

  test('login handles API errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await expect(async () => {
      await act(async () => {
        loginButton.click();
      });
    }).rejects.toThrow('Invalid credentials');

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('logout function works correctly', async () => {
    const mockToken = 'existing.jwt.token';
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as testuser');
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    
    act(() => {
      logoutButton.click();
    });

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in');
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('signup function works correctly', async () => {
    const mockToken = 'signup.jwt.token';
    const mockUser = { id: 2, username: 'newuser', email: 'new@example.com' };
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: mockToken, user: mockUser }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signupButton = screen.getByRole('button', { name: /signup/i });
    
    await act(async () => {
      signupButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as newuser');
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: 'testuser', 
        email: 'test@example.com', 
        password: 'password' 
      }),
    });
  });

  test('dataApi includes authorization header when authenticated', async () => {
    const mockToken = 'valid.jwt.token';
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Mock initial token verification
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    // Mock cover letter API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ coverLetterData: {} }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as testuser');
    });

    const getCoverLetterButton = screen.getByRole('button', { name: /get cover letter/i });
    
    await act(async () => {
      getCoverLetterButton.click();
    });

    expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:5000/api/cover-letter', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${mockToken}`,
        'Content-Type': 'application/json',
      },
    });
  });

  test('handles 401 responses by logging out user', async () => {
    const mockToken = 'expired.jwt.token';
    const mockUser = { id: 1, username: 'testuser', email: 'test@example.com' };
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));
    
    // Mock initial token verification (success)
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ valid: true }),
    });

    // Mock API call that returns 401
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Token expired' }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Logged in as testuser');
    });

    const getCoverLetterButton = screen.getByRole('button', { name: /get cover letter/i });
    
    await expect(async () => {
      await act(async () => {
        getCoverLetterButton.click();
      });
    }).rejects.toThrow('Session expired. Please log in again.');

    // User should be logged out
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in');
    });
    expect(localStorage.getItem('token')).toBeNull();
  });

  test('handles network errors gracefully', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    
    await expect(async () => {
      await act(async () => {
        loginButton.click();
      });
    }).rejects.toThrow('Network error');

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not logged in');
  });

  test('provides all required API methods', () => {
    let contextValue;
    
    const TestConsumer = () => {
      contextValue = useAuth();
      return null;
    };

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    // Check authApi methods
    expect(contextValue.authApi).toHaveProperty('login');
    expect(contextValue.authApi).toHaveProperty('signup');
    expect(contextValue.authApi).toHaveProperty('forgotPassword');
    expect(contextValue.authApi).toHaveProperty('resetPassword');

    // Check dataApi methods
    expect(contextValue.dataApi).toHaveProperty('coverLetter');
    expect(contextValue.dataApi).toHaveProperty('jobApplications');
    expect(contextValue.dataApi).toHaveProperty('resume');
    expect(contextValue.dataApi).toHaveProperty('interviewPractice');
    expect(contextValue.dataApi).toHaveProperty('salarySearches');

    // Check dataApi structure
    expect(contextValue.dataApi.coverLetter).toHaveProperty('get');
    expect(contextValue.dataApi.coverLetter).toHaveProperty('save');
    expect(contextValue.dataApi.jobApplications).toHaveProperty('getAll');
    expect(contextValue.dataApi.jobApplications).toHaveProperty('create');
    expect(contextValue.dataApi.jobApplications).toHaveProperty('update');
    expect(contextValue.dataApi.jobApplications).toHaveProperty('delete');
  });
}); 