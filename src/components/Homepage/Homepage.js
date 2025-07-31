import React from 'react';
import './Homepage.css';

function Homepage({ onNavigate }) {
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
    </div>
  );
}

export default Homepage; 