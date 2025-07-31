import React, { useState, useEffect } from 'react';
import './InterviewPrep.css';

function InterviewPrep({ onBack }) {
  const [activeSection, setActiveSection] = useState('categories');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [practiceHistory, setPracticeHistory] = useState([]);

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
    general: {
      name: "General Questions",
      icon: "💼",
      color: "gradient-purple",
      description: "Common questions about your background, goals, and motivation",
      questions: [
        "Tell me about yourself.",
        "Why are you interested in this position?",
        "What are your greatest strengths?",
        "What is your biggest weakness?",
        "Where do you see yourself in 5 years?",
        "Why are you leaving your current job?",
        "What motivates you at work?",
        "How do you handle stress and pressure?",
        "What are you looking for in your next role?",
        "Do you have any questions for us?"
      ]
    },
    company: {
      name: "Company-Specific",
      icon: "🏢",
      color: "gradient-orange",
      description: "Questions to help you prepare for specific company research",
      questions: [
        "What do you know about our company?",
        "Why do you want to work for us specifically?",
        "How do you think you can contribute to our team?",
        "What interests you most about our industry?",
        "How do your values align with our company culture?",
        "What do you think are the biggest challenges facing our industry?",
        "How would you improve our product/service?",
        "What do you think sets us apart from our competitors?",
        "How do you see this role fitting into our organization?",
        "What questions do you have about our company culture?"
      ]
    }
  };

  const interviewTips = [
    {
      title: "STAR Method",
      description: "Use Situation, Task, Action, Result to structure behavioral answers",
      icon: "⭐"
    },
    {
      title: "Research the Company",
      description: "Know their mission, values, recent news, and competitors",
      icon: "🔍"
    },
    {
      title: "Prepare Questions",
      description: "Have thoughtful questions ready about the role and company",
      icon: "❓"
    },
    {
      title: "Practice Out Loud",
      description: "Practice speaking your answers, not just thinking them",
      icon: "🗣️"
    },
    {
      title: "Body Language",
      description: "Maintain eye contact, sit up straight, and show enthusiasm",
      icon: "🤝"
    },
    {
      title: "Follow Up",
      description: "Send a thank-you email within 24 hours",
      icon: "📧"
    }
  ];

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

  // Load practice history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('interviewPracticeHistory');
    if (saved) {
      setPracticeHistory(JSON.parse(saved));
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    setUserAnswer('');
    setActiveSection('practice');
    resetTimer();
  };

  const nextQuestion = () => {
    const questions = questionCategories[selectedCategory].questions;
    if (currentQuestionIndex < questions.length - 1) {
      saveCurrentPractice();
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      resetTimer();
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      saveCurrentPractice();
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setUserAnswer('');
      resetTimer();
    }
  };

  const saveCurrentPractice = () => {
    if (userAnswer.trim() && selectedCategory) {
      const practice = {
        id: Date.now(),
        category: selectedCategory,
        question: questionCategories[selectedCategory].questions[currentQuestionIndex],
        answer: userAnswer,
        timeSpent: timer,
        date: new Date().toLocaleDateString()
      };
      
      const updated = [practice, ...practiceHistory].slice(0, 50); // Keep last 50 practices
      setPracticeHistory(updated);
      localStorage.setItem('interviewPracticeHistory', JSON.stringify(updated));
    }
  };

  const clearHistory = () => {
    setPracticeHistory([]);
    localStorage.removeItem('interviewPracticeHistory');
  };

  const getCurrentQuestion = () => {
    if (!selectedCategory) return '';
    return questionCategories[selectedCategory].questions[currentQuestionIndex];
  };

  const getCurrentCategory = () => {
    if (!selectedCategory) return null;
    return questionCategories[selectedCategory];
  };

  return (
    <div className="interview-prep">
      <header className="App-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
          <div className="header-text">
            <h1>🎯 Interview Prep</h1>
            <p>Practice common interview questions and ace your next interview</p>
          </div>
        </div>
      </header>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeSection === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveSection('categories')}
        >
          📚 Question Categories
        </button>
        <button 
          className={`tab-button ${activeSection === 'practice' ? 'active' : ''}`}
          onClick={() => setActiveSection('practice')}
          disabled={!selectedCategory}
        >
          🎤 Practice Session
        </button>
        <button 
          className={`tab-button ${activeSection === 'tips' ? 'active' : ''}`}
          onClick={() => setActiveSection('tips')}
        >
          💡 Interview Tips
        </button>
        <button 
          className={`tab-button ${activeSection === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSection('history')}
        >
          📈 Practice History
        </button>
      </div>

      <main className="main-content">
        {/* Categories Section */}
        {activeSection === 'categories' && (
          <div className="categories-container">
            <div className="section-header">
              <h2>Choose a Question Category</h2>
              <p>Select a category to start practicing interview questions</p>
            </div>
            
            <div className="categories-grid">
              {Object.entries(questionCategories).map(([key, category]) => (
                <div 
                  key={key}
                  className={`category-card ${category.color}`}
                  onClick={() => selectCategory(key)}
                >
                  <div className="card-content">
                    <div className="card-icon">
                      <span>{category.icon}</span>
                    </div>
                    <h3 className="card-title">{category.name}</h3>
                    <p className="card-description">{category.description}</p>
                    <div className="question-count">
                      {category.questions.length} questions
                    </div>
                    <div className="card-arrow">→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice Section */}
        {activeSection === 'practice' && selectedCategory && (
          <div className="practice-container">
            <div className="practice-header">
              <div className="category-info">
                <span className="category-icon">{getCurrentCategory().icon}</span>
                <h2>{getCurrentCategory().name}</h2>
                <span className="question-counter">
                  Question {currentQuestionIndex + 1} of {getCurrentCategory().questions.length}
                </span>
              </div>
              
              <div className="timer-controls">
                <div className="timer-display">
                  <span className="timer-icon">⏱️</span>
                  <span className="timer-time">{formatTime(timer)}</span>
                </div>
                <div className="timer-buttons">
                  {!isTimerRunning ? (
                    <button className="btn-secondary" onClick={startTimer}>Start Timer</button>
                  ) : (
                    <button className="btn-secondary" onClick={stopTimer}>Pause Timer</button>
                  )}
                  <button className="btn-secondary" onClick={resetTimer}>Reset</button>
                </div>
              </div>
            </div>

            <div className="question-section">
              <div className="question-card">
                <h3>Interview Question:</h3>
                <p className="question-text">{getCurrentQuestion()}</p>
              </div>

              <div className="answer-section">
                <label htmlFor="userAnswer">Your Answer:</label>
                <textarea
                  id="userAnswer"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Practice your answer here... Remember to use the STAR method for behavioral questions (Situation, Task, Action, Result)"
                  rows="10"
                />
              </div>

              <div className="navigation-controls">
                <button 
                  className="btn-secondary" 
                  onClick={previousQuestion}
                  disabled={currentQuestionIndex === 0}
                >
                  ← Previous Question
                </button>
                
                <button className="btn-primary" onClick={() => saveCurrentPractice()}>
                  💾 Save Practice
                </button>
                
                <button 
                  className="btn-secondary" 
                  onClick={nextQuestion}
                  disabled={currentQuestionIndex === getCurrentCategory().questions.length - 1}
                >
                  Next Question →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        {activeSection === 'tips' && (
          <div className="tips-container">
            <div className="section-header">
              <h2>Interview Success Tips</h2>
              <p>Essential strategies to help you succeed in your interviews</p>
            </div>
            
            <div className="tips-grid">
              {interviewTips.map((tip, index) => (
                <div key={index} className="tip-card">
                  <div className="tip-icon">{tip.icon}</div>
                  <h3 className="tip-title">{tip.title}</h3>
                  <p className="tip-description">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Section */}
        {activeSection === 'history' && (
          <div className="history-container">
            <div className="section-header">
              <h2>Practice History</h2>
              <p>Review your previous practice sessions</p>
              {practiceHistory.length > 0 && (
                <button className="btn-secondary" onClick={clearHistory}>
                  🗑️ Clear History
                </button>
              )}
            </div>
            
            {practiceHistory.length === 0 ? (
              <div className="no-history">
                <h3>No Practice History Yet</h3>
                <p>Start practicing questions to see your history here!</p>
                <button className="btn-primary" onClick={() => setActiveSection('categories')}>
                  📚 Start Practicing
                </button>
              </div>
            ) : (
              <div className="history-list">
                {practiceHistory.map((practice) => (
                  <div key={practice.id} className="history-item">
                    <div className="history-header">
                      <span className="history-category">
                        {questionCategories[practice.category].icon} {questionCategories[practice.category].name}
                      </span>
                      <span className="history-date">{practice.date}</span>
                      <span className="history-time">⏱️ {formatTime(practice.timeSpent)}</span>
                    </div>
                    <div className="history-question">
                      <strong>Q:</strong> {practice.question}
                    </div>
                    <div className="history-answer">
                      <strong>A:</strong> {practice.answer.substring(0, 200)}
                      {practice.answer.length > 200 && '...'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default InterviewPrep; 