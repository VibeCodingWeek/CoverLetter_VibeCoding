import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './JobTracker.css';

function JobTracker({ onBack }) {
  const { dataApi, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('dateApplied');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

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

  // Load data from API on component mount
  useEffect(() => {
    const loadJobApplications = async () => {
      if (!isAuthenticated) {
        // If not authenticated, try to load from localStorage as fallback
        const saved = localStorage.getItem('jobApplications');
        if (saved) {
          setApplications(JSON.parse(saved));
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await dataApi.jobApplications.getAll();
        if (response.applications) {
          setApplications(response.applications);
        }
      } catch (error) {
        console.error('Error loading job applications:', error);
        setError('Failed to load your job applications. You can still add new ones.');
        
        // Fallback to localStorage
        const saved = localStorage.getItem('jobApplications');
        if (saved) {
          setApplications(JSON.parse(saved));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadJobApplications();
  }, [isAuthenticated, dataApi]);

  // Save data to localStorage when not authenticated (as backup)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('jobApplications', JSON.stringify(applications));
    }
  }, [applications, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear messages when user starts typing
    if (saveMessage) setSaveMessage('');
    if (error) setError('');
  };

  const addApplication = async () => {
    if (!formData.company.trim() || !formData.position.trim()) {
      setError('Company and position are required');
      return;
    }

    if (!isAuthenticated) {
      // Fallback to localStorage for non-authenticated users
      const newApp = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setApplications(prev => [newApp, ...prev]);
      resetForm();
      setShowAddForm(false);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await dataApi.jobApplications.create(formData);
      
      // Add the new application to the local state
      const newApp = {
        id: response.id,
        ...formData,
        createdAt: new Date().toISOString()
      };
      setApplications(prev => [newApp, ...prev]);
      
      setSaveMessage('✅ Job application added successfully!');
      resetForm();
      setShowAddForm(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error adding job application:', error);
      setError(`Failed to add application: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updateApplication = async () => {
    if (!formData.company.trim() || !formData.position.trim()) {
      setError('Company and position are required');
      return;
    }

    if (!isAuthenticated) {
      // Fallback to localStorage for non-authenticated users
      setApplications(prev => 
        prev.map(app => 
          app.id === editingApp.id 
            ? { ...app, ...formData, updatedAt: new Date().toISOString() }
            : app
        )
      );
      resetForm();
      setEditingApp(null);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await dataApi.jobApplications.update(editingApp.id, formData);
      
      // Update the application in local state
      setApplications(prev => 
        prev.map(app => 
          app.id === editingApp.id 
            ? { ...app, ...formData, updatedAt: new Date().toISOString() }
            : app
        )
      );
      
      setSaveMessage('✅ Job application updated successfully!');
      resetForm();
      setEditingApp(null);
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error updating job application:', error);
      setError(`Failed to update application: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) {
      return;
    }

    if (!isAuthenticated) {
      // Fallback to localStorage for non-authenticated users
      setApplications(prev => prev.filter(app => app.id !== id));
      return;
    }

    try {
      await dataApi.jobApplications.delete(id);
      setApplications(prev => prev.filter(app => app.id !== id));
      setSaveMessage('✅ Job application deleted successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting job application:', error);
      setError(`Failed to delete application: ${error.message}`);
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
    setError('');
    setSaveMessage('');
  };

  const startEditing = (app) => {
    setFormData({
      company: app.company || '',
      position: app.position || '',
      location: app.location || '',
      salary: app.salary || '',
      jobUrl: app.jobUrl || '',
      status: app.status || 'applied',
      dateApplied: app.dateApplied || new Date().toISOString().split('T')[0],
      followUpDate: app.followUpDate || '',
      notes: app.notes || '',
      contactPerson: app.contactPerson || '',
      contactEmail: app.contactEmail || ''
    });
    setEditingApp(app);
    setShowAddForm(true);
  };

  const cancelEditing = () => {
    setEditingApp(null);
    setShowAddForm(false);
    resetForm();
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => filterStatus === 'all' || app.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'dateApplied') {
        return new Date(b.dateApplied) - new Date(a.dateApplied);
      } else if (sortBy === 'company') {
        return a.company.localeCompare(b.company);
      } else if (sortBy === 'status') {
        return a.status.localeCompare(b.status);
      }
      return 0;
    });

  // Get status statistics
  const statusStats = statusOptions.map(status => ({
    ...status,
    count: applications.filter(app => app.status === status.value).length
  }));

  if (isLoading) {
    return (
      <div className="job-tracker">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your job applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="job-tracker">
      <header className="tracker-header">
        <div className="header-content">
          <button onClick={onBack} className="back-button">
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h1>📊 Job Application Tracker</h1>
            <p>Manage and track your job applications efficiently</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setShowAddForm(true)} 
              className="add-btn"
              disabled={isSaving}
            >
              {isSaving ? '💾 Saving...' : '➕ Add Application'}
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
          ⚠️ You're not logged in. Your data will only be saved locally and may be lost. Please log in to save permanently.
        </div>
      )}

      <div className="tracker-tabs">
        <button 
          className={`tab-button ${activeSection === 'applications' ? 'active' : ''}`}
          onClick={() => setActiveSection('applications')}
        >
          📋 Applications ({applications.length})
        </button>
        <button 
          className={`tab-button ${activeSection === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveSection('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {activeSection === 'applications' && (
        <div className="applications-section">
          {/* Filters and Controls */}
          <div className="controls-bar">
            <div className="filters">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status ({applications.length})</option>
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.icon} {status.label} ({applications.filter(app => app.status === status.value).length})
                  </option>
                ))}
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="dateApplied">Sort by Date Applied</option>
                <option value="company">Sort by Company</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>

          {/* Applications List */}
          <div className="applications-grid">
            {filteredApplications.length === 0 ? (
              <div className="no-applications">
                <div className="no-applications-icon">📝</div>
                <h3>No Applications Found</h3>
                <p>
                  {filterStatus === 'all' 
                    ? "You haven't added any job applications yet." 
                    : `No applications with status "${statusOptions.find(s => s.value === filterStatus)?.label}".`
                  }
                </p>
                <button onClick={() => setShowAddForm(true)} className="add-first-btn">
                  ➕ Add Your First Application
                </button>
              </div>
            ) : (
              filteredApplications.map(app => (
                <div key={app.id} className="application-card">
                  <div className="card-header">
                    <div className="company-info">
                      <h3>{app.company}</h3>
                      <p className="position">{app.position}</p>
                      {app.location && <p className="location">📍 {app.location}</p>}
                    </div>
                    <div className="card-actions">
                      <button 
                        onClick={() => startEditing(app)} 
                        className="edit-btn"
                        title="Edit Application"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => deleteApplication(app.id)} 
                        className="delete-btn"
                        title="Delete Application"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-body">
                    <div className="status-badge" style={{ backgroundColor: statusOptions.find(s => s.value === app.status)?.color }}>
                      {statusOptions.find(s => s.value === app.status)?.icon} {statusOptions.find(s => s.value === app.status)?.label}
                    </div>
                    
                    <div className="application-details">
                      <div className="detail-item">
                        <span className="label">Applied:</span>
                        <span className="value">{new Date(app.dateApplied).toLocaleDateString()}</span>
                      </div>
                      
                      {app.salary && (
                        <div className="detail-item">
                          <span className="label">Salary:</span>
                          <span className="value">{app.salary}</span>
                        </div>
                      )}
                      
                      {app.followUpDate && (
                        <div className="detail-item">
                          <span className="label">Follow Up:</span>
                          <span className="value">{new Date(app.followUpDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {app.contactPerson && (
                        <div className="detail-item">
                          <span className="label">Contact:</span>
                          <span className="value">{app.contactPerson}</span>
                        </div>
                      )}
                    </div>
                    
                    {app.notes && (
                      <div className="notes">
                        <strong>Notes:</strong>
                        <p>{app.notes}</p>
                      </div>
                    )}
                    
                    {app.jobUrl && (
                      <div className="job-link">
                        <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="link-btn">
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

      {activeSection === 'analytics' && (
        <div className="analytics-section">
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Total Applications</h3>
                <p className="stat-number">{applications.length}</p>
              </div>
            </div>
            
            {statusStats.map(stat => (
              <div key={stat.value} className="stat-card" style={{ borderColor: stat.color }}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-content">
                  <h3>{stat.label}</h3>
                  <p className="stat-number">{stat.count}</p>
                  {applications.length > 0 && (
                    <p className="stat-percentage">
                      {Math.round((stat.count / applications.length) * 100)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => !editingApp && cancelEditing()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingApp ? 'Edit Application' : 'Add New Application'}</h2>
              <button onClick={cancelEditing} className="modal-close">×</button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); editingApp ? updateApplication() : addApplication(); }}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="company">Company *</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="position">Position *</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="Enter job title"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State or Remote"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="salary">Salary</label>
                  <input
                    type="text"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    placeholder="e.g., $80,000 - $100,000"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="dateApplied">Date Applied</label>
                  <input
                    type="date"
                    id="dateApplied"
                    name="dateApplied"
                    value={formData.dateApplied}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="followUpDate">Follow Up Date</label>
                  <input
                    type="date"
                    id="followUpDate"
                    name="followUpDate"
                    value={formData.followUpDate}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contactPerson">Contact Person</label>
                  <input
                    type="text"
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    placeholder="Hiring manager or recruiter name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contactEmail">Contact Email</label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="contact@company.com"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="jobUrl">Job URL</label>
                  <input
                    type="url"
                    id="jobUrl"
                    name="jobUrl"
                    value={formData.jobUrl}
                    onChange={handleInputChange}
                    placeholder="https://company.com/jobs/123"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes about this application..."
                    rows="3"
                  />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" onClick={cancelEditing} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={isSaving}>
                  {isSaving ? '💾 Saving...' : (editingApp ? '✅ Update Application' : '✅ Add Application')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobTracker; 