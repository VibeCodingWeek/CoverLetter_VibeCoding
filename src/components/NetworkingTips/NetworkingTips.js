import React, { useState, useEffect } from 'react';
import './NetworkingTips.css';

function NetworkingTips({ onBack }) {
  const [activeSection, setActiveSection] = useState('tips');
  const [contacts, setContacts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  
  const [contactForm, setContactForm] = useState({
    name: '',
    company: '',
    position: '',
    email: '',
    linkedin: '',
    relationship: 'acquaintance',
    notes: '',
    lastContact: ''
  });

  const [goalForm, setGoalForm] = useState({
    title: '',
    description: '',
    target: '',
    deadline: '',
    status: 'active'
  });

  const networkingTips = [
    {
      category: 'Building Connections',
      icon: '🤝',
      tips: [
        'Attend industry events, conferences, and meetups regularly',
        'Join professional associations and online communities',
        'Leverage alumni networks from your school or previous companies',
        'Volunteer for causes you care about to meet like-minded professionals',
        'Use LinkedIn to connect with people after meeting them in person'
      ]
    },
    {
      category: 'Online Networking',
      icon: '💻',
      tips: [
        'Optimize your LinkedIn profile with a professional photo and compelling headline',
        'Share valuable industry content and engage with others\' posts',
        'Join relevant LinkedIn and Facebook groups in your field',
        'Participate in Twitter chats and professional forums',
        'Write thoughtful comments on others\' professional content'
      ]
    },
    {
      category: 'Maintaining Relationships',
      icon: '🔄',
      tips: [
        'Follow up within 24-48 hours after meeting someone new',
        'Send periodic updates about your career progress',
        'Offer help and resources to your network when possible',
        'Remember personal details and ask about them in future conversations',
        'Set reminders to reach out to contacts every 3-6 months'
      ]
    },
    {
      category: 'Professional Communication',
      icon: '💬',
      tips: [
        'Craft personalized messages instead of generic connection requests',
        'Be specific about how you can help others',
        'Always express gratitude for time and assistance received',
        'Keep messages concise but warm and genuine',
        'Follow up on commitments and promises made during conversations'
      ]
    }
  ];

  const messageTemplates = [
    {
      title: 'Initial LinkedIn Connection',
      purpose: 'Connecting after meeting at an event',
      template: `Hi [Name],

It was great meeting you at [Event Name] yesterday! I really enjoyed our conversation about [Specific Topic]. 

I'd love to stay connected and continue our discussion about [Industry/Topic]. Looking forward to keeping in touch!

Best regards,
[Your Name]`
    },
    {
      title: 'Informational Interview Request',
      purpose: 'Asking for career advice',
      template: `Dear [Name],

I hope this message finds you well. I'm currently [Your Situation - e.g., exploring a career change, recent graduate] and am very interested in learning more about [Their Field/Company].

Would you be open to a brief 15-20 minute phone call or coffee to share your insights about [Specific Topic]? I'd be happy to work around your schedule.

Thank you for considering my request!

Best regards,
[Your Name]`
    },
    {
      title: 'Follow-up After Help',
      purpose: 'Thanking someone who provided assistance',
      template: `Hi [Name],

I wanted to follow up and let you know that [Outcome of their help - e.g., I got the interview, I successfully made the career transition]. 

Your advice about [Specific Advice] was incredibly valuable and made a real difference. I truly appreciate you taking the time to help me.

I'd love to return the favor someday. Please don't hesitate to reach out if there's anything I can do for you.

Warm regards,
[Your Name]`
    },
    {
      title: 'Reconnecting with Old Contact',
      purpose: 'Re-engaging with dormant connections',
      template: `Hi [Name],

I hope you're doing well! It's been a while since we last spoke at [Company/Event]. I've been following your career progression at [Their Current Company] - congratulations on [Recent Achievement]!

I wanted to reconnect as I'm [Your Current Situation]. I'd love to hear what you've been up to and share some updates from my end as well.

Would you be interested in grabbing coffee sometime soon?

Best,
[Your Name]`
    }
  ];

  // Load data from localStorage
  useEffect(() => {
    const savedContacts = localStorage.getItem('networkingContacts');
    const savedGoals = localStorage.getItem('networkingGoals');
    
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('networkingContacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('networkingGoals', JSON.stringify(goals));
  }, [goals]);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const newContact = {
      id: Date.now(),
      ...contactForm,
      createdAt: new Date().toISOString()
    };
    setContacts(prev => [newContact, ...prev]);
    setContactForm({
      name: '', company: '', position: '', email: '', linkedin: '',
      relationship: 'acquaintance', notes: '', lastContact: ''
    });
    setShowContactForm(false);
  };

  const handleGoalSubmit = (e) => {
    e.preventDefault();
    const newGoal = {
      id: Date.now(),
      ...goalForm,
      createdAt: new Date().toISOString()
    };
    setGoals(prev => [newGoal, ...prev]);
    setGoalForm({
      title: '', description: '', target: '', deadline: '', status: 'active'
    });
    setShowGoalForm(false);
  };

  const updateGoalStatus = (id, status) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id ? { ...goal, status, completedAt: status === 'completed' ? new Date().toISOString() : null } : goal
    ));
  };

  const deleteContact = (id) => {
    setContacts(prev => prev.filter(contact => contact.id !== id));
  };

  const deleteGoal = (id) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const copyTemplate = (template) => {
    navigator.clipboard.writeText(template);
    alert('Template copied to clipboard!');
  };

  return (
    <div className="networking-tips">
      <header className="App-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
          <div className="header-text">
            <h1>🤝 Networking Tips</h1>
            <p>Build meaningful professional relationships and advance your career</p>
          </div>
        </div>
      </header>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeSection === 'tips' ? 'active' : ''}`}
          onClick={() => setActiveSection('tips')}
        >
          💡 Tips & Strategies
        </button>
        <button 
          className={`tab-button ${activeSection === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveSection('templates')}
        >
          📝 Message Templates
        </button>
        <button 
          className={`tab-button ${activeSection === 'contacts' ? 'active' : ''}`}
          onClick={() => setActiveSection('contacts')}
        >
          👥 My Network ({contacts.length})
        </button>
        <button 
          className={`tab-button ${activeSection === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveSection('goals')}
        >
          🎯 Networking Goals ({goals.filter(g => g.status === 'active').length})
        </button>
      </div>

      <main className="main-content">
        {/* Tips Section */}
        {activeSection === 'tips' && (
          <div className="tips-container">
            <div className="section-header">
              <h2>Networking Tips & Strategies</h2>
              <p>Expert advice to help you build and maintain professional relationships</p>
            </div>

            <div className="tips-grid">
              {networkingTips.map((category, index) => (
                <div key={index} className="tip-category">
                  <div className="category-header">
                    <span className="category-icon">{category.icon}</span>
                    <h3>{category.category}</h3>
                  </div>
                  <ul className="tips-list">
                    {category.tips.map((tip, tipIndex) => (
                      <li key={tipIndex}>{tip}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="networking-guide">
              <h3>🚀 5-Step Networking Action Plan</h3>
              <div className="action-steps">
                <div className="action-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Define Your Goals</h4>
                    <p>Identify what you want to achieve through networking - job opportunities, mentorship, industry insights, or career guidance.</p>
                  </div>
                </div>
                <div className="action-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Identify Target Connections</h4>
                    <p>Research people in your industry, target companies, or roles you aspire to. Look for mutual connections who can introduce you.</p>
                  </div>
                </div>
                <div className="action-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Prepare Your Pitch</h4>
                    <p>Craft a compelling 30-second introduction that explains who you are, what you do, and what you're looking for.</p>
                  </div>
                </div>
                <div className="action-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Take Action</h4>
                    <p>Attend events, reach out on LinkedIn, schedule informational interviews, and actively engage with your professional community.</p>
                  </div>
                </div>
                <div className="action-step">
                  <div className="step-number">5</div>
                  <div className="step-content">
                    <h4>Follow Up & Maintain</h4>
                    <p>Send thank you messages, schedule regular check-ins, share relevant opportunities, and nurture your relationships over time.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Templates Section */}
        {activeSection === 'templates' && (
          <div className="templates-container">
            <div className="section-header">
              <h2>Message Templates</h2>
              <p>Professional communication templates for various networking scenarios</p>
            </div>

            <div className="templates-grid">
              {messageTemplates.map((template, index) => (
                <div key={index} className="template-card">
                  <div className="template-header">
                    <h3>{template.title}</h3>
                    <button 
                      className="copy-btn"
                      onClick={() => copyTemplate(template.template)}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <p className="template-purpose">{template.purpose}</p>
                  <div className="template-content">
                    <pre>{template.template}</pre>
                  </div>
                </div>
              ))}
            </div>

            <div className="template-tips">
              <h3>💡 Template Usage Tips</h3>
              <ul>
                <li>Always personalize templates with specific details about the person and situation</li>
                <li>Replace bracketed placeholders with actual names and information</li>
                <li>Keep messages concise but warm and genuine</li>
                <li>Proofread before sending to avoid typos and errors</li>
                <li>Follow up if you don't receive a response within a reasonable timeframe</li>
              </ul>
            </div>
          </div>
        )}

        {/* Contacts Section */}
        {activeSection === 'contacts' && (
          <div className="contacts-container">
            <div className="section-header">
              <h2>My Professional Network</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowContactForm(true)}
              >
                + Add Contact
              </button>
            </div>

            {/* Add Contact Form */}
            {showContactForm && (
              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-header">
                  <h3>Add New Contact</h3>
                  <button 
                    type="button" 
                    className="close-btn"
                    onClick={() => setShowContactForm(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={contactForm.company}
                    onChange={(e) => setContactForm(prev => ({ ...prev, company: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Position/Title"
                    value={contactForm.position}
                    onChange={(e) => setContactForm(prev => ({ ...prev, position: e.target.value }))}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn Profile"
                    value={contactForm.linkedin}
                    onChange={(e) => setContactForm(prev => ({ ...prev, linkedin: e.target.value }))}
                  />
                  <select
                    value={contactForm.relationship}
                    onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                  >
                    <option value="acquaintance">Acquaintance</option>
                    <option value="colleague">Colleague</option>
                    <option value="mentor">Mentor</option>
                    <option value="friend">Friend</option>
                    <option value="client">Client</option>
                  </select>
                </div>
                
                <textarea
                  placeholder="Notes about this contact..."
                  value={contactForm.notes}
                  onChange={(e) => setContactForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                />
                
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowContactForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Contact
                  </button>
                </div>
              </form>
            )}

            {/* Contacts List */}
            <div className="contacts-grid">
              {contacts.length === 0 ? (
                <div className="empty-state">
                  <h3>No Contacts Yet</h3>
                  <p>Start building your professional network by adding contacts you meet.</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="contact-card">
                    <div className="contact-header">
                      <div className="contact-avatar">
                        {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div className="contact-info">
                        <h3>{contact.name}</h3>
                        {contact.position && <p>{contact.position}</p>}
                        {contact.company && <p className="company">{contact.company}</p>}
                      </div>
                      <button 
                        className="delete-btn"
                        onClick={() => deleteContact(contact.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    
                    <div className="contact-details">
                      <div className="relationship-badge">
                        {contact.relationship}
                      </div>
                      {contact.email && (
                        <a href={`mailto:${contact.email}`} className="contact-link">
                          📧 Email
                        </a>
                      )}
                      {contact.linkedin && (
                        <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="contact-link">
                          💼 LinkedIn
                        </a>
                      )}
                      {contact.notes && (
                        <p className="contact-notes">{contact.notes}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Goals Section */}
        {activeSection === 'goals' && (
          <div className="goals-container">
            <div className="section-header">
              <h2>Networking Goals</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowGoalForm(true)}
              >
                + Add Goal
              </button>
            </div>

            {/* Add Goal Form */}
            {showGoalForm && (
              <form className="goal-form" onSubmit={handleGoalSubmit}>
                <div className="form-header">
                  <h3>Add Networking Goal</h3>
                  <button 
                    type="button" 
                    className="close-btn"
                    onClick={() => setShowGoalForm(false)}
                  >
                    ×
                  </button>
                </div>
                
                <div className="form-grid">
                  <input
                    type="text"
                    placeholder="Goal Title *"
                    value={goalForm.title}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Target (e.g., 5 new connections)"
                    value={goalForm.target}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, target: e.target.value }))}
                  />
                  <input
                    type="date"
                    placeholder="Deadline"
                    value={goalForm.deadline}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                
                <textarea
                  placeholder="Goal description and action plan..."
                  value={goalForm.description}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                />
                
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowGoalForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Add Goal
                  </button>
                </div>
              </form>
            )}

            {/* Goals List */}
            <div className="goals-list">
              {goals.length === 0 ? (
                <div className="empty-state">
                  <h3>No Networking Goals Set</h3>
                  <p>Set specific goals to focus your networking efforts and track progress.</p>
                </div>
              ) : (
                goals.map((goal) => (
                  <div key={goal.id} className={`goal-card ${goal.status}`}>
                    <div className="goal-header">
                      <div className="goal-info">
                        <h3>{goal.title}</h3>
                        {goal.target && <p className="goal-target">Target: {goal.target}</p>}
                        {goal.deadline && (
                          <p className="goal-deadline">
                            Deadline: {new Date(goal.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      
                      <div className="goal-actions">
                        <select
                          value={goal.status}
                          onChange={(e) => updateGoalStatus(goal.id, e.target.value)}
                          className="status-select"
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="paused">Paused</option>
                        </select>
                        <button 
                          className="delete-btn"
                          onClick={() => deleteGoal(goal.id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    {goal.description && (
                      <p className="goal-description">{goal.description}</p>
                    )}
                    
                    <div className="goal-meta">
                      <span>Created: {new Date(goal.createdAt).toLocaleDateString()}</span>
                      {goal.completedAt && (
                        <span>Completed: {new Date(goal.completedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default NetworkingTips; 