import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// API Base URL
const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }, []);

  // API utility function with authentication
  const apiCall = useCallback(async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid, logout user
          logout();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(data.message || 'An error occurred');
      }

      return data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }, [logout]);

  // Check for existing user session on app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          // Verify token with backend
          try {
            const response = await apiCall('/verify-token');
            if (response.valid) {
              const userData = JSON.parse(storedUser);
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('user');
              localStorage.removeItem('token');
            }
          } catch (error) {
            // Token verification failed, clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, [apiCall]);

  const login = useCallback((userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  }, []);

  // Authentication API methods
  const authApi = useCallback(() => ({
    signup: async (userData) => {
      const response = await apiCall('/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      if (response.user && response.token) {
        login(response.user, response.token);
      }
      return response;
    },

    login: async (credentials) => {
      const response = await apiCall('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (response.user && response.token) {
        login(response.user, response.token);
      }
      return response;
    },

    forgotPassword: async (email) => {
      return await apiCall('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    resetPassword: async (email, newPassword) => {
      const response = await apiCall('/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, newPassword }),
      });
      if (response.user && response.token) {
        login(response.user, response.token);
      }
      return response;
    },
  }), [apiCall, login]);

  // Data API methods
  const dataApi = useCallback(() => ({
    // Cover Letter API
    coverLetter: {
      get: () => apiCall('/cover-letter'),
      save: (data) => apiCall('/cover-letter', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      update: (data) => apiCall('/cover-letter', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    },

    // Job Applications API
    jobApplications: {
      getAll: () => apiCall('/job-applications'),
      create: (data) => apiCall('/job-applications', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      update: (id, data) => apiCall(`/job-applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
      delete: (id) => apiCall(`/job-applications/${id}`, {
        method: 'DELETE',
      }),
    },

    // Resume API
    resume: {
      get: () => apiCall('/resume'),
      save: (data) => apiCall('/resume', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
      update: (data) => apiCall('/resume', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    },

    // Interview Practice API
    interviewPractice: {
      getHistory: () => apiCall('/interview-practice'),
      saveSession: (data) => apiCall('/interview-practice', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    },

    // Salary Searches API
    salarySearches: {
      getAll: () => apiCall('/salary-searches'),
      save: (data) => apiCall('/salary-searches', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    },
  }), [apiCall]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    authApi: authApi(),
    dataApi: dataApi(),
    apiCall, // For any custom API calls
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 