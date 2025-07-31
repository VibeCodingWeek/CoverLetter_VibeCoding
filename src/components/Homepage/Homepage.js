import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';
import './Homepage.css';

function Homepage({ onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  const openAuthModal = (mode) => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  const switchAuthMode = () => {
    setAuthModal(prev => ({
      ...prev,
      mode: prev.mode === 'login' ? 'signup' : 'login'
    }));
  };

  const handleAuthSuccess = (userData) => {
    // The login is handled by the AuthContext through the AuthModal
    console.log('User logged in:', userData);
  };

  const handleLogout = () => {
    logout();
  };
  const menuItems = [
    {
      id: 'cover-letter',
      title: 'Generate Cover Letter',
      description: 'Create professional cover letters in minutes',
      icon: '✍️',
      color: 'gradient-purple',
      action: () => onNavigate('cover-letter')
    },
    {
      id: 'resume-builder',
      title: 'Resume Builder',
      description: 'Build stunning resumes that get noticed',
      icon: '📄',
      color: 'gradient-blue',
      action: () => onNavigate('resume-builder')
    },
    {
      id: 'interview-prep',
      title: 'Interview Prep',
      description: 'Practice common interview questions',
      icon: '🎯',
      color: 'gradient-green',
      action: () => onNavigate('interview-prep')
    },
    {
      id: 'job-tracker',
      title: 'Job Application Tracker',
      description: 'Track your job applications and follow-ups',
      icon: '📊',
      color: 'gradient-orange',
      action: () => onNavigate('job-tracker')
    },
    {
      id: 'salary-insights',
      title: 'Salary Insights',
      description: 'Research salary ranges for your field',
      icon: '💰',
      color: 'gradient-teal',
      action: () => onNavigate('salary-insights')
    },
    {
      id: 'networking',
      title: 'Networking Tips',
      description: 'Build professional connections effectively',
      icon: '🤝',
      color: 'gradient-pink',
      action: () => onNavigate('networking-tips')
    }
  ];

  return (
    <div className="homepage">
      {/* Authentication Header */}
      <header className="auth-header">
        <div className="auth-header-content">
          <div className="logo">
            <h3>Career Journey</h3>
          </div>
          <div className="auth-buttons">
            {isAuthenticated ? (
              <div className="user-menu">
                <span className="welcome-text">Welcome, {user?.username}!</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <div className="login-signup-buttons">
                <button 
                  onClick={() => openAuthModal('login')} 
                  className="login-btn"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => openAuthModal('signup')} 
                  className="signup-btn"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to Your Career Journey
          </h1>
          <p className="hero-subtitle">
            Your all-in-one platform for landing your dream job
          </p>
          <div className="hero-description">
            <p>
              Empower your job search with professional tools designed to help you stand out. 
              From crafting perfect cover letters to tracking applications, we've got you covered.
            </p>
          </div>
        </div>
        <div className="hero-animation">
          <div className="floating-elements">
            <div className="floating-element" style={{ animationDelay: '0s' }}>💼</div>
            <div className="floating-element" style={{ animationDelay: '0.5s' }}>🚀</div>
            <div className="floating-element" style={{ animationDelay: '1s' }}>⭐</div>
            <div className="floating-element" style={{ animationDelay: '1.5s' }}>🎯</div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="tools-section">
        <div className="section-header">
          <h2>Choose Your Tool</h2>
          <p>Select from our suite of career development tools</p>
        </div>
        
        <div className="menu-grid">
          {menuItems.map((item) => (
            <div 
              key={item.id} 
              className={`menu-card ${item.color}`}
              onClick={item.action}
            >
              <div className="card-content">
                <div className="card-icon">
                  <span>{item.icon}</span>
                </div>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-description">{item.description}</p>
                <div className="card-arrow">→</div>
              </div>
              <div className="card-hover-effect"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-content">
          <h2>Why Choose Our Platform?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon">⚡</div>
              <h3>Lightning Fast</h3>
              <p>Generate professional documents in seconds</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🎨</div>
              <h3>Professional Design</h3>
              <p>Beautiful, ATS-friendly templates</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <h3>Privacy Focused</h3>
              <p>Your data stays secure and private</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon">📱</div>
              <h3>Mobile Friendly</h3>
              <p>Work on any device, anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModal.isOpen}
        mode={authModal.mode}
        onClose={closeAuthModal}
        onSwitchMode={switchAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default Homepage; 