import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, mode, onSwitchMode, onAuthSuccess }) {
  const { authApi } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    newPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState('email'); // 'email' or 'reset'
  const [foundUser, setFoundUser] = useState(null);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (showForgotPassword) {
      if (forgotPasswordStep === 'email') {
        // Email validation for forgot password
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
      } else {
        // New password validation
        if (!formData.newPassword) {
          newErrors.newPassword = 'New password is required';
        } else if (formData.newPassword.length < 6) {
          newErrors.newPassword = 'Password must be at least 6 characters long';
        }
      }
    } else {
      // Regular login/signup validation
      // Username validation (required for signup)
      if (mode === 'signup' && !formData.username.trim()) {
        newErrors.username = 'Username is required';
      }

      // Email validation
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      // Password validation
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (mode === 'signup' && formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters long';
      }

      // Confirm password validation (signup only)
      if (mode === 'signup') {
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      if (showForgotPassword) {
        if (forgotPasswordStep === 'email') {
          // Check if user exists
          const response = await authApi.forgotPassword(formData.email);
          setFoundUser(response.username);
          setForgotPasswordStep('reset');
        } else {
          // Reset password
          const response = await authApi.resetPassword(formData.email, formData.newPassword);
          
          // User is automatically logged in after password reset
          onAuthSuccess(response.user);
          onClose();
          resetForm();
        }
      } else {
        // Regular login/signup
        const payload = mode === 'login' 
          ? { email: formData.email, password: formData.password }
          : { 
              username: formData.username, 
              email: formData.email, 
              password: formData.password 
            };

        const response = mode === 'login' 
          ? await authApi.login(payload)
          : await authApi.signup(payload);
        
        onAuthSuccess(response.user);
        onClose();
        resetForm();
      }
    } catch (error) {
      setErrors({ general: error.message || 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      newPassword: ''
    });
    setErrors({});
    setShowForgotPassword(false);
    setForgotPasswordStep('email');
    setFoundUser(null);
  };

  const handleSwitchMode = () => {
    resetForm();
    onSwitchMode();
  };

  const handleShowForgotPassword = () => {
    setErrors({});
    setShowForgotPassword(true);
    setForgotPasswordStep('email');
  };

  const handleBackToLogin = () => {
    resetForm();
    setShowForgotPassword(false);
  };

  // Improved click outside handler - only close if clicking directly on overlay
  const handleOverlayClick = (e) => {
    // Only close if the clicked element is the overlay itself, not a child
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle modal content click to prevent propagation
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  const getModalTitle = () => {
    if (showForgotPassword) {
      return forgotPasswordStep === 'email' ? 'Forgot Password' : 'Reset Password';
    }
    return mode === 'login' ? 'Welcome Back!' : 'Create Account';
  };

  const getModalSubtitle = () => {
    if (showForgotPassword) {
      if (forgotPasswordStep === 'email') {
        return 'Enter your email to reset your password';
      } else {
        return `Hi ${foundUser}! Enter your new password`;
      }
    }
    return mode === 'login' ? 'Sign in to your account' : 'Join us to get started';
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal" onClick={handleModalClick}>
        <button 
          className="auth-modal-close" 
          onClick={onClose}
          type="button"
          aria-label="Close modal"
        >
          ×
        </button>
        
        <div className="auth-modal-header">
          <h2>{getModalTitle()}</h2>
          <p>{getModalSubtitle()}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {errors.general && (
            <div className="error-message general-error">
              {errors.general}
            </div>
          )}

          {!showForgotPassword && mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={errors.username ? 'error' : ''}
                placeholder="Enter your username"
                autoComplete="username"
              />
              {errors.username && (
                <span className="error-message">{errors.username}</span>
              )}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              disabled={showForgotPassword && forgotPasswordStep === 'reset'}
              autoComplete="email"
            />
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {showForgotPassword && forgotPasswordStep === 'reset' && (
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={errors.newPassword ? 'error' : ''}
                placeholder="Enter your new password"
                autoComplete="new-password"
              />
              {errors.newPassword && (
                <span className="error-message">{errors.newPassword}</span>
              )}
            </div>
          )}

          {!showForgotPassword && (
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Enter your password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>
          )}

          {!showForgotPassword && mode === 'signup' && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (
              showForgotPassword 
                ? (forgotPasswordStep === 'email' ? 'Check Email' : 'Reset Password')
                : (mode === 'login' ? 'Sign In' : 'Create Account')
            )}
          </button>
        </form>

        {!showForgotPassword && (
          <>
            {mode === 'login' && (
              <div className="auth-forgot">
                <button 
                  type="button" 
                  onClick={handleShowForgotPassword} 
                  className="forgot-password-btn"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <div className="auth-switch">
              <p>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                <button type="button" onClick={handleSwitchMode} className="switch-btn">
                  {mode === 'login' ? 'Sign Up' : 'Sign In'}
                </button>
              </p>
            </div>
          </>
        )}

        {showForgotPassword && (
          <div className="auth-switch">
            <p>
              <button type="button" onClick={handleBackToLogin} className="switch-btn">
                Back to Sign In
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AuthModal; 