import React, { useState, useEffect } from 'react';
import './JobTracker.css';

function JobTracker({ onBack }) {
  const [activeSection, setActiveSection] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dateApplied');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    location: '',
    salary: '',
    jobUrl: '',
    status: 'applied',
    dateApplied: new Date().toISOString().split('T')[0],
    followUpDate: '',
    notes: '',
    contactPerson: '',
    contactEmail: ''
  });

  const statusOptions = [
    { value: 'applied', label: 'Applied', color: '#3b82f6', icon: '📧' },
    { value: 'screening', label: 'Phone/Video Screening', color: '#f59e0b', icon: '📞' },
    { value: 'interview', label: 'Interview Scheduled', color: '#8b5cf6', icon: '🎤' },
    { value: 'offer', label: 'Offer Received', color: '#10b981', icon: '🎉' },
    { value: 'rejected', label: 'Rejected', color: '#ef4444', icon: '❌' },
    { value: 'withdrawn', label: 'Withdrawn', color: '#6b7280', icon: '🚫' }
  ];

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jobApplications');
    if (saved) {
      setApplications(JSON.parse(saved));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('jobApplications', JSON.stringify(applications));
  }, [applications]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addApplication = () => {
    const newApp = {
      id: Date.now(),
      ...formData,
      createdAt: new Date().toISOString()
    };
    setApplications(prev => [newApp, ...prev]);
    resetForm();
    setShowAddForm(false);
  };

  const updateApplication = () => {
    setApplications(prev => 
      prev.map(app => 
        app.id === editingApp.id ? { ...app, ...formData } : app
      )
    );
    resetForm();
    setEditingApp(null);
  };

  const deleteApplication = (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      setApplications(prev => prev.filter(app => app.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      location: '',
      salary: '',
      jobUrl: '',
      status: 'applied',
      dateApplied: new Date().toISOString().split('T')[0],
      followUpDate: '',
      notes: '',
      contactPerson: '',
      contactEmail: ''
    });
  };

  const startEdit = (app) => {
    setFormData({ ...app });
    setEditingApp(app);
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    resetForm();
    setEditingApp(null);
    setShowAddForm(false);
  };

  const getStatusConfig = (status) => {
    return statusOptions.find(opt => opt.value === status) || statusOptions[0];
  };

  const getFilteredApplications = () => {
    let filtered = applications;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }
    
    // Sort applications
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dateApplied':
          return new Date(b.dateApplied) - new Date(a.dateApplied);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const getStatistics = () => {
    const stats = {
      total: applications.length,
      applied: 0,
      screening: 0,
      interview: 0,
      offer: 0,
      rejected: 0,
      withdrawn: 0
    };
    
    applications.forEach(app => {
      stats[app.status]++;
    });
    
    return stats;
  };

  const exportData = () => {
    const dataStr = JSON.stringify(applications, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `job-applications-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = getStatistics();
  const filteredApps = getFilteredApplications();

  return (
    <div className="job-tracker">
      <header className="App-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
          <div className="header-text">
            <h1>📊 Job Application Tracker</h1>
            <p>Track and manage your job applications efficiently</p>
          </div>
        </div>
      </header>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeSection === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveSection('applications')}
        >
          📋 Applications ({applications.length})
        </button>
        <button 
          className={`tab-button ${activeSection === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveSection('statistics')}
        >
          📈 Statistics
        </button>
        <button 
          className={`tab-button ${activeSection === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveSection('analytics')}
        >
          📊 Analytics
        </button>
      </div>

      <main className="main-content">
        {/* Applications Section */}
        {activeSection === 'applications' && (
          <div className="applications-container">
            {/* Controls */}
            <div className="controls-bar">
              <div className="controls-left">
                <button 
                  className="btn-primary" 
                  onClick={() => setShowAddForm(true)}
                >
                  + Add Application
                </button>
                
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status ({applications.length})</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.icon} {status.label} ({stats[status.value]})
                    </option>
                  ))}
                </select>
                
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="dateApplied">Sort by Date</option>
                  <option value="company">Sort by Company</option>
                  <option value="status">Sort by Status</option>
                </select>
              </div>
              
              <div className="controls-right">
                <button className="btn-secondary" onClick={exportData}>
                  📤 Export Data
                </button>
              </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
              <div className="add-form-container">
                <div className="form-header">
                  <h3>{editingApp ? 'Edit Application' : 'Add New Application'}</h3>
                  <button className="close-btn" onClick={cancelEdit}>×</button>
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Company *</label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Google, Microsoft, etc."
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Position *</label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="Software Engineer, Product Manager"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="San Francisco, CA / Remote"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Salary Range</label>
                    <input
                      type="text"
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                      placeholder="$100K - $150K"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Job URL</label>
                    <input
                      type="url"
                      name="jobUrl"
                      value={formData.jobUrl}
                      onChange={handleInputChange}
                      placeholder="https://company.com/careers/job-id"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Status</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleInputChange}
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.icon} {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Date Applied</label>
                    <input
                      type="date"
                      name="dateApplied"
                      value={formData.dateApplied}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Follow-up Date</label>
                    <input
                      type="date"
                      name="followUpDate"
                      value={formData.followUpDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleInputChange}
                      placeholder="Hiring Manager Name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="recruiter@company.com"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Interview feedback, follow-up notes, etc."
                    rows="3"
                  />
                </div>
                
                <div className="form-actions">
                  <button className="btn-secondary" onClick={cancelEdit}>
                    Cancel
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={editingApp ? updateApplication : addApplication}
                    disabled={!formData.company || !formData.position}
                  >
                    {editingApp ? 'Update Application' : 'Add Application'}
                  </button>
                </div>
              </div>
            )}

            {/* Applications List */}
            <div className="applications-list">
              {filteredApps.length === 0 ? (
                <div className="empty-state">
                  <h3>No Applications Found</h3>
                  <p>
                    {applications.length === 0 
                      ? "Start tracking your job applications by clicking 'Add Application'" 
                      : "No applications match your current filter criteria"
                    }
                  </p>
                </div>
              ) : (
                filteredApps.map((app) => (
                  <div key={app.id} className="application-card">
                    <div className="card-header">
                      <div className="company-info">
                        <h3>{app.company}</h3>
                        <p>{app.position}</p>
                        {app.location && <span className="location">📍 {app.location}</span>}
                      </div>
                      
                      <div className="card-actions">
                        <div 
                          className="status-badge" 
                          style={{ backgroundColor: getStatusConfig(app.status).color }}
                        >
                          {getStatusConfig(app.status).icon} {getStatusConfig(app.status).label}
                        </div>
                        <div className="action-buttons">
                          <button 
                            className="btn-edit" 
                            onClick={() => startEdit(app)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-delete" 
                            onClick={() => deleteApplication(app.id)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-details">
                      <div className="detail-row">
                        <span className="label">Applied:</span>
                        <span>{new Date(app.dateApplied).toLocaleDateString()}</span>
                      </div>
                      
                      {app.salary && (
                        <div className="detail-row">
                          <span className="label">Salary:</span>
                          <span>{app.salary}</span>
                        </div>
                      )}
                      
                      {app.followUpDate && (
                        <div className="detail-row">
                          <span className="label">Follow-up:</span>
                          <span>{new Date(app.followUpDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {app.contactPerson && (
                        <div className="detail-row">
                          <span className="label">Contact:</span>
                          <span>{app.contactPerson}</span>
                        </div>
                      )}
                      
                      {app.notes && (
                        <div className="detail-row notes">
                          <span className="label">Notes:</span>
                          <span>{app.notes}</span>
                        </div>
                      )}
                      
                      {app.jobUrl && (
                        <div className="detail-row">
                          <a 
                            href={app.jobUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="job-link"
                          >
                            🔗 View Job Posting
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Statistics Section */}
        {activeSection === 'statistics' && (
          <div className="statistics-container">
            <div className="section-header">
              <h2>Application Statistics</h2>
              <p>Overview of your job search progress</p>
            </div>
            
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{stats.total}</h3>
                  <p>Total Applications</p>
                </div>
              </div>
              
              {statusOptions.map(status => (
                <div key={status.value} className="stat-card">
                  <div 
                    className="stat-icon"
                    style={{ backgroundColor: status.color }}
                  >
                    {status.icon}
                  </div>
                  <div className="stat-content">
                    <h3>{stats[status.value]}</h3>
                    <p>{status.label}</p>
                    <span className="percentage">
                      {stats.total > 0 ? Math.round((stats[status.value] / stats.total) * 100) : 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {applications.length > 0 && (
              <div className="progress-section">
                <h3>Application Pipeline</h3>
                <div className="progress-bar">
                  {statusOptions.map(status => {
                    const percentage = stats.total > 0 ? (stats[status.value] / stats.total) * 100 : 0;
                    return (
                      <div 
                        key={status.value}
                        className="progress-segment"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: status.color 
                        }}
                        title={`${status.label}: ${stats[status.value]} (${Math.round(percentage)}%)`}
                      />
                    );
                  })}
                </div>
                <div className="progress-legend">
                  {statusOptions.map(status => (
                    <div key={status.value} className="legend-item">
                      <div 
                        className="legend-color" 
                        style={{ backgroundColor: status.color }}
                      />
                      <span>{status.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analytics Section */}
        {activeSection === 'analytics' && (
          <div className="analytics-container">
            <div className="section-header">
              <h2>Job Search Analytics</h2>
              <p>Insights to improve your job search strategy</p>
            </div>
            
            {applications.length === 0 ? (
              <div className="empty-state">
                <h3>No Data Available</h3>
                <p>Add some job applications to see analytics and insights.</p>
              </div>
            ) : (
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>Success Rate</h3>
                  <div className="metric">
                    <span className="number">
                      {Math.round(((stats.offer + stats.interview) / stats.total) * 100)}%
                    </span>
                    <p>Applications leading to interviews or offers</p>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Response Rate</h3>
                  <div className="metric">
                    <span className="number">
                      {Math.round(((stats.total - stats.applied) / stats.total) * 100)}%
                    </span>
                    <p>Applications with company response</p>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Average Time</h3>
                  <div className="metric">
                    <span className="number">
                      {applications.length > 0 ? 
                        Math.round((Date.now() - new Date(applications[applications.length - 1].dateApplied)) / (1000 * 60 * 60 * 24)) 
                        : 0} days
                    </span>
                    <p>Since first application</p>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>Most Active</h3>
                  <div className="metric">
                    <span className="number">
                      {new Date().toLocaleDateString('en-US', { month: 'long' })}
                    </span>
                    <p>Month for applications</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="tips-section">
              <h3>💡 Job Search Tips</h3>
              <div className="tips-grid">
                <div className="tip-card">
                  <h4>📧 Follow Up</h4>
                  <p>Follow up 1-2 weeks after applying if you haven't heard back.</p>
                </div>
                <div className="tip-card">
                  <h4>🎯 Quality over Quantity</h4>
                  <p>Focus on applications that match your skills and interests.</p>
                </div>
                <div className="tip-card">
                  <h4>📝 Tailor Applications</h4>
                  <p>Customize your resume and cover letter for each position.</p>
                </div>
                <div className="tip-card">
                  <h4>🔗 Network</h4>
                  <p>Use LinkedIn and personal connections to get referrals.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default JobTracker; 