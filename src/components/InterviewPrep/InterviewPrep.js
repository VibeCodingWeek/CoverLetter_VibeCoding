import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './InterviewPrep.css';

function InterviewPrep({ onBack }) {
  const { dataApi, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  // Interview question database
  const questionCategories = {
    behavioral: {
      name: "Behavioral Questions",
      icon: "🧠",
      color: "gradient-blue",
      description: "Questions about your past experiences and how you handle situations",
      questions: [
        "Tell me about a time when you had to overcome a significant challenge at work.",
        "Describe a situation where you had to work with a difficult team member.",
        "Give me an example of a time when you failed and how you handled it.",
        "Tell me about a time when you had to adapt to a significant change at work.",
        "Describe a situation where you had to meet a tight deadline.",
        "Tell me about a time when you had to take initiative on a project.",
        "Give me an example of when you had to persuade someone to see your point of view.",
        "Describe a time when you received constructive criticism and how you responded.",
        "Tell me about a time when you had to work under pressure.",
        "Give me an example of when you had to solve a complex problem."
      ]
    },
    technical: {
      name: "Technical Questions",
      icon: "💻",
      color: "gradient-green",
      description: "Questions about your technical skills and problem-solving abilities",
      questions: [
        "Explain a complex technical concept to someone without a technical background.",
        "Describe your experience with [specific technology/tool relevant to the role].",
        "How do you stay updated with the latest developments in your field?",
        "Walk me through your problem-solving process for a technical challenge.",
        "Describe a time when you had to learn a new technology quickly.",
        "How do you approach debugging a complex issue?",
        "Explain a project you're particularly proud of and the technical challenges involved.",
        "How do you ensure the quality and reliability of your work?",
        "Describe your experience with collaborative development (version control, code reviews, etc.).",
        "How do you prioritize technical debt versus new feature development?"
      ]
    },
    situational: {
      name: "Situational Questions",
      icon: "🎯",
      color: "gradient-purple",
      description: "Hypothetical scenarios to assess your decision-making skills",
      questions: [
        "What would you do if you disagreed with your manager's decision?",
        "How would you handle a situation where you have multiple urgent deadlines?",
        "What would you do if you discovered a mistake in your work after it was submitted?",
        "How would you approach a project with unclear requirements?",
        "What would you do if a team member wasn't contributing to a group project?",
        "How would you handle receiving negative feedback from a client?",
        "What would you do if you were asked to do something outside your job description?",
        "How would you prioritize tasks when everything seems urgent?",
        "What would you do if you realized you couldn't meet a promised deadline?",
        "How would you handle a conflict between two team members?"
      ]
    },
    company: {
      name: "Company-Specific Questions",
      icon: "🏢",
      color: "gradient-orange",
      description: "Questions about the company, role, and your motivation",
      questions: [
        "Why do you want to work for our company?",
        "What do you know about our products/services?",
        "How do your values align with our company culture?",
        "Where do you see yourself in 5 years?",
        "Why are you leaving your current job?",
        "What interests you most about this role?",
        "How would you contribute to our team?",
        "What do you think are the biggest challenges facing our industry?",
        "Why should we hire you over other candidates?",
        "What questions do you have for us?"
      ]
    }
  };

  // Load practice history from API on component mount
  useEffect(() => {
    const loadPracticeHistory = async () => {
      if (!isAuthenticated) {
        // If not authenticated, try to load from localStorage as fallback
        const saved = localStorage.getItem('interviewPracticeHistory');
        if (saved) {
          setPracticeHistory(JSON.parse(saved));
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await dataApi.interviewPractice.getHistory();
        if (response.history) {
          setPracticeHistory(response.history);
        }
      } catch (error) {
        console.error('Error loading practice history:', error);
        setError('Failed to load your practice history. You can still practice questions.');
        
        // Fallback to localStorage
        const saved = localStorage.getItem('interviewPracticeHistory');
        if (saved) {
          setPracticeHistory(JSON.parse(saved));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPracticeHistory();
  }, [isAuthenticated, dataApi]);

  // Save practice history to localStorage when not authenticated (as backup)
  useEffect(() => {
    if (!isAuthenticated && practiceHistory.length > 0) {
      localStorage.setItem('interviewPracticeHistory', JSON.stringify(practiceHistory));
    }
  }, [practiceHistory, isAuthenticated]);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    } else if (!isTimerRunning && timer !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    setIsTimerRunning(true);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setTimer(0);
    setIsTimerRunning(false);
  };

  const selectCategory = (categoryKey) => {
    setSelectedCategory(categoryKey);
    setCurrentQuestionIndex(0);
    setActiveSection('practice');
    setUserAnswer('');
    resetTimer();
  };

  const nextQuestion = () => {
    const category = questionCategories[selectedCategory];
    if (currentQuestionIndex < category.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      resetTimer();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer('');
      resetTimer();
    }
  };

  const saveAnswer = async () => {
    if (!userAnswer.trim()) {
      setError('Please enter an answer before saving.');
      return;
    }

    const practice = {
      category: selectedCategory,
      question: questionCategories[selectedCategory].questions[currentQuestionIndex],
      userAnswer: userAnswer,
      timeTaken: timer,
      sessionDate: new Date().toISOString()
    };

    if (!isAuthenticated) {
      // Fallback to localStorage for non-authenticated users
      const updated = [practice, ...practiceHistory].slice(0, 50);
      setPracticeHistory(updated);
      localStorage.setItem('interviewPracticeHistory', JSON.stringify(updated));
      setSaveMessage('✅ Practice session saved locally!');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await dataApi.interviewPractice.saveSession(practice);
      
      // Update local state
      const updated = [practice, ...practiceHistory].slice(0, 50);
      setPracticeHistory(updated);
      
      setSaveMessage('✅ Practice session saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving practice session:', error);
      setError(`Failed to save practice session: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all practice history? This cannot be undone.')) {
      setPracticeHistory([]);
      localStorage.removeItem('interviewPracticeHistory');
      setSaveMessage('✅ Practice history cleared successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const goBackToCategories = () => {
    setActiveSection('categories');
    setSelectedCategory(null);
    setUserAnswer('');
    resetTimer();
    setError('');
  };

  if (isLoading) {
    return (
      <div className="interview-prep">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your practice history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-prep">
      <header className="prep-header">
        <div className="header-content">
          <button onClick={onBack} className="back-button">
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h1>🎤 Interview Preparation</h1>
            <p>Practice common interview questions and build confidence</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setActiveSection('history')} 
              className="history-btn"
            >
              📊 View History ({practiceHistory.length})
            </button>
          </div>
        </div>
      </header>

      {/* Status Messages */}
      {saveMessage && (
        <div className="status-message success">
          {saveMessage}
        </div>
      )}
      
      {error && (
        <div className="status-message error">
          ⚠️ {error}
        </div>
      )}

      {!isAuthenticated && (
        <div className="status-message warning">
          ⚠️ You're not logged in. Your practice sessions will only be saved locally and may be lost. Please log in to save permanently.
        </div>
      )}

      <div className="prep-tabs">
        <button 
          className={`tab-button ${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveSection('categories')}
        >
          📝 Question Categories
        </button>
        <button 
          className={`tab-button ${activeSection === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveSection('practice')}
          disabled={!selectedCategory}
        >
          🎯 Practice Session
        </button>
        <button 
          className={`tab-button ${activeSection === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSection('history')}
        >
          📊 Practice History
        </button>
      </div>

      {/* Categories Section */}
      {activeSection === 'categories' && (
        <div className="categories-section">
          <div className="categories-grid">
            {Object.entries(questionCategories).map(([key, category]) => (
              <div 
                key={key} 
                className={`category-card ${category.color}`}
                onClick={() => selectCategory(key)}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-content">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <div className="category-stats">
                    <span className="question-count">
                      {category.questions.length} questions
                    </span>
                  </div>
                </div>
                <div className="category-arrow">→</div>
              </div>
            ))}
          </div>
          
          <div className="tips-section">
            <h3>💡 Interview Tips</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <h4>📚 Research</h4>
                <p>Learn about the company, its products, culture, and recent news before your interview.</p>
              </div>
              <div className="tip-card">
                <h4>⭐ STAR Method</h4>
                <p>Structure your answers using Situation, Task, Action, Result for behavioral questions.</p>
              </div>
              <div className="tip-card">
                <h4>❓ Ask Questions</h4>
                <p>Prepare thoughtful questions about the role, team, and company to show genuine interest.</p>
              </div>
              <div className="tip-card">
                <h4>🎯 Practice</h4>
                <p>Practice your answers out loud to build confidence and improve your delivery.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Practice Section */}
      {activeSection === 'practice' && selectedCategory && (
        <div className="practice-section">
          <div className="practice-header">
            <button onClick={goBackToCategories} className="back-btn">
              ← Back to Categories
            </button>
            <div className="category-info">
              <h2>
                {questionCategories[selectedCategory].icon} {questionCategories[selectedCategory].name}
              </h2>
              <p>Question {currentQuestionIndex + 1} of {questionCategories[selectedCategory].questions.length}</p>
            </div>
            <div className="timer-section">
              <div className="timer-display">
                <span className="timer-icon">⏱️</span>
                <span className="timer-time">{formatTime(timer)}</span>
              </div>
              <div className="timer-controls">
                {!isTimerRunning ? (
                  <button onClick={startTimer} className="timer-btn start">
                    ▶️ Start
                  </button>
                ) : (
                  <button onClick={stopTimer} className="timer-btn stop">
                    ⏸️ Pause
                  </button>
                )}
                <button onClick={resetTimer} className="timer-btn reset">
                  🔄 Reset
                </button>
              </div>
            </div>
          </div>

          <div className="question-container">
            <div className="question-card">
              <h3>Interview Question:</h3>
              <p className="question-text">
                {questionCategories[selectedCategory].questions[currentQuestionIndex]}
              </p>
            </div>
            
            <div className="answer-section">
              <h3>Your Answer:</h3>
              <textarea
                value={userAnswer}
                onChange={(e) => {
                  setUserAnswer(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Type your answer here. Think about specific examples and use the STAR method for behavioral questions..."
                rows="10"
                className="answer-textarea"
              />
              
              <div className="practice-actions">
                <div className="navigation-buttons">
                  <button 
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="nav-btn prev"
                  >
                    ← Previous Question
                  </button>
                  <button 
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === questionCategories[selectedCategory].questions.length - 1}
                    className="nav-btn next"
                  >
                    Next Question →
                  </button>
                </div>
                
                <button 
                  onClick={saveAnswer}
                  className="save-answer-btn"
                  disabled={isSaving || !userAnswer.trim()}
                >
                  {isSaving ? '💾 Saving...' : '💾 Save Answer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Section */}
      {activeSection === 'history' && (
        <div className="history-section">
          <div className="history-header">
            <h2>📊 Practice History</h2>
            <div className="history-actions">
              {practiceHistory.length > 0 && (
                <button onClick={clearHistory} className="clear-history-btn">
                  🗑️ Clear History
                </button>
              )}
            </div>
          </div>

          {practiceHistory.length > 0 && (
            <div className="history-stats">
              <div className="stat-card">
                <h3>Total Sessions</h3>
                <p className="stat-number">{practiceHistory.length}</p>
              </div>
              <div className="stat-card">
                <h3>Average Time</h3>
                <p className="stat-number">
                  {formatTime(Math.round(practiceHistory.reduce((acc, p) => acc + p.timeTaken, 0) / practiceHistory.length))}
                </p>
              </div>
              <div className="stat-card">
                <h3>Categories Practiced</h3>
                <p className="stat-number">
                  {new Set(practiceHistory.map(p => p.category)).size}
                </p>
              </div>
            </div>
          )}

          <div className="history-list">
            {practiceHistory.length === 0 ? (
              <div className="no-history">
                <div className="no-history-icon">📋</div>
                <h3>No Practice History</h3>
                <p>Start practicing interview questions to build your history and track your progress.</p>
                <button onClick={() => setActiveSection('categories')} className="start-practicing-btn">
                  🎯 Start Practicing
                </button>
              </div>
            ) : (
              <div className="history-items">
                {practiceHistory.map((practice, index) => (
                  <div key={index} className="history-item">
                    <div className="practice-meta">
                      <div className="practice-info">
                        <span className="category-badge">
                          {questionCategories[practice.category]?.icon} {questionCategories[practice.category]?.name}
                        </span>
                        <span className="practice-date">
                          {new Date(practice.sessionDate).toLocaleDateString()} at {new Date(practice.sessionDate).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="practice-stats">
                        <span className="time-taken">⏱️ {formatTime(practice.timeTaken)}</span>
                      </div>
                    </div>
                    
                    <div className="practice-content">
                      <div className="practice-question">
                        <h4>Question:</h4>
                        <p>{practice.question}</p>
                      </div>
                      
                      <div className="practice-answer">
                        <h4>Your Answer:</h4>
                        <p>{practice.userAnswer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default InterviewPrep; 