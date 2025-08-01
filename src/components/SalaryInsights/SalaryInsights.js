import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './SalaryInsights.css';

function SalaryInsights({ onBack }) {
  const { dataApi, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('search');
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: '',
    experience: '1-3',
    company: '',
    skills: ''
  });
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  const experienceOptions = [
    { value: '0-1', label: '0-1 years' },
    { value: '1-3', label: '1-3 years' },
    { value: '3-5', label: '3-5 years' },
    { value: '5-10', label: '5-10 years' },
    { value: '10+', label: '10+ years' }
  ];

  const jobCategories = [
    'Software Engineer',
    'Product Manager',
    'Data Scientist',
    'Marketing Manager',
    'Sales Manager',
    'UX Designer',
    'Business Analyst',
    'Project Manager',
    'DevOps Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Machine Learning Engineer',
    'Security Engineer',
    'Quality Assurance Engineer'
  ];

  const popularLocations = [
    'San Francisco, CA',
    'New York, NY',
    'Seattle, WA',
    'Austin, TX',
    'Boston, MA',
    'Los Angeles, CA',
    'Chicago, IL',
    'Denver, CO',
    'Washington, DC',
    'Atlanta, GA',
    'Remote'
  ];

  // Load saved searches from API on component mount
  useEffect(() => {
    const loadSavedSearches = async () => {
      if (!isAuthenticated) {
        // If not authenticated, try to load from localStorage as fallback
    const saved = localStorage.getItem('salarySearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
        return;
      }

      setIsLoading(true);
      try {
        const response = await dataApi.salarySearches.getAll();
        if (response.searches) {
          setSavedSearches(response.searches);
        }
      } catch (error) {
        console.error('Error loading salary searches:', error);
        setError('Failed to load your saved searches. You can still perform new searches.');
        
        // Fallback to localStorage
        const saved = localStorage.getItem('salarySearches');
        if (saved) {
          setSavedSearches(JSON.parse(saved));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedSearches();
  }, [isAuthenticated, dataApi]);

  // Save searches to localStorage when not authenticated (as backup)
  useEffect(() => {
    if (!isAuthenticated && savedSearches.length > 0) {
    localStorage.setItem('salarySearches', JSON.stringify(savedSearches));
    }
  }, [savedSearches, isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear messages when user starts typing
    if (saveMessage) setSaveMessage('');
    if (error) setError('');
  };

  const generateSalaryData = (jobTitle, location, experience) => {
    // This is a mock salary calculation
    // In a real app, you'd call an API like Glassdoor, PayScale, etc.
    
    const baseSalaries = {
      'Software Engineer': { min: 80000, max: 150000 },
      'Product Manager': { min: 100000, max: 180000 },
      'Data Scientist': { min: 90000, max: 160000 },
      'Marketing Manager': { min: 70000, max: 120000 },
      'Sales Manager': { min: 60000, max: 140000 },
      'UX Designer': { min: 70000, max: 130000 },
      'Business Analyst': { min: 60000, max: 100000 },
      'Project Manager': { min: 75000, max: 125000 },
      'DevOps Engineer': { min: 85000, max: 155000 },
      'Frontend Developer': { min: 70000, max: 140000 },
      'Backend Developer': { min: 75000, max: 145000 },
      'Full Stack Developer': { min: 80000, max: 150000 },
      'Machine Learning Engineer': { min: 100000, max: 180000 },
      'Security Engineer': { min: 90000, max: 170000 },
      'Quality Assurance Engineer': { min: 60000, max: 110000 }
    };

    const locationMultipliers = {
      'San Francisco, CA': 1.4,
      'New York, NY': 1.3,
      'Seattle, WA': 1.25,
      'Austin, TX': 1.1,
      'Boston, MA': 1.2,
      'Los Angeles, CA': 1.15,
      'Chicago, IL': 1.05,
      'Denver, CO': 1.0,
      'Washington, DC': 1.15,
      'Atlanta, GA': 0.95,
      'Remote': 1.1
    };

    const experienceMultipliers = {
      '0-1': 0.8,
      '1-3': 1.0,
      '3-5': 1.2,
      '5-10': 1.4,
      '10+': 1.6
    };

    const baseRange = baseSalaries[jobTitle] || baseSalaries['Software Engineer'];
    const locationMult = locationMultipliers[location] || 1.0;
    const expMult = experienceMultipliers[experience] || 1.0;

    const adjustedMin = Math.round(baseRange.min * locationMult * expMult);
    const adjustedMax = Math.round(baseRange.max * locationMult * expMult);
    const average = Math.round((adjustedMin + adjustedMax) / 2);

    return {
      jobTitle,
      location,
      experience,
      salaryRange: {
        min: adjustedMin,
        max: adjustedMax,
        average: average
      },
      marketData: {
        percentile25: Math.round(adjustedMin * 1.1),
        percentile50: average,
        percentile75: Math.round(adjustedMax * 0.9),
        totalCompensation: Math.round(average * 1.2)
      },
      insights: [
        `${jobTitle} positions in ${location} typically pay ${((locationMult - 1) * 100).toFixed(0)}% ${locationMult > 1 ? 'above' : 'below'} the national average.`,
        `With ${experience} years of experience, you can expect to earn ${((expMult - 1) * 100).toFixed(0)}% ${expMult > 1 ? 'more' : 'less'} than entry-level positions.`,
        `The job market for ${jobTitle} is currently ${Math.random() > 0.5 ? 'strong' : 'competitive'} with ${Math.floor(Math.random() * 50 + 10)}% year-over-year growth.`,
        `Total compensation including benefits typically ranges from ${Math.round(average * 1.1).toLocaleString()} to ${Math.round(average * 1.3).toLocaleString()}.`
      ],
      searchDate: new Date().toISOString()
    };
  };

  const handleSearch = async () => {
    if (!formData.jobTitle.trim() || !formData.location.trim()) {
      setError('Please enter both job title and location.');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const results = generateSalaryData(
        formData.jobTitle,
        formData.location,
        formData.experience
      );

      setSearchResults(results);
      setActiveSection('results');
    } catch (error) {
      setError('Failed to search salary data. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const saveSearch = async () => {
    if (!searchResults) {
      setError('No search results to save.');
      return;
    }

    const searchToSave = {
      ...searchResults,
      company: formData.company,
      skills: formData.skills,
      savedDate: new Date().toISOString()
    };

    if (!isAuthenticated) {
      // Fallback to localStorage for non-authenticated users
      const updated = [searchToSave, ...savedSearches].slice(0, 20);
      setSavedSearches(updated);
      localStorage.setItem('salarySearches', JSON.stringify(updated));
      setSaveMessage('✅ Search saved locally!');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await dataApi.salarySearches.save(searchToSave);
      
      // Update local state
      const updated = [searchToSave, ...savedSearches].slice(0, 20);
      setSavedSearches(updated);
      
      setSaveMessage('✅ Search saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving salary search:', error);
      setError(`Failed to save search: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all saved searches? This cannot be undone.')) {
      setSavedSearches([]);
      localStorage.removeItem('salarySearches');
      setSaveMessage('✅ Search history cleared successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const formatSalary = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="salary-insights">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your saved searches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="salary-insights">
      <header className="insights-header">
        <div className="header-content">
          <button onClick={onBack} className="back-button">
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h1>💰 Salary Insights</h1>
            <p>Research competitive salaries and negotiate with confidence</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => setActiveSection('history')} 
              className="history-btn"
            >
              📊 Saved Searches ({savedSearches.length})
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
          ⚠️ You're not logged in. Your searches will only be saved locally and may be lost. Please log in to save permanently.
        </div>
      )}

      <div className="insights-tabs">
        <button 
          className={`tab-button ${activeSection === 'search' ? 'active' : ''}`}
          onClick={() => setActiveSection('search')}
        >
          🔍 Salary Search
        </button>
        <button 
          className={`tab-button ${activeSection === 'results' ? 'active' : ''}`}
          onClick={() => setActiveSection('results')}
          disabled={!searchResults}
        >
          📈 Results
        </button>
        <button 
          className={`tab-button ${activeSection === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSection('history')}
        >
          💾 Saved Searches
        </button>
      </div>

      {/* Search Section */}
        {activeSection === 'search' && (
        <div className="search-section">
            <div className="search-form">
            <h2>🔍 Search Salary Information</h2>
            <p>Enter your job details to get comprehensive salary insights</p>

              <div className="form-grid">
                <div className="form-group">
                <label htmlFor="jobTitle">Job Title *</label>
                <input
                  type="text"
                  id="jobTitle"
                    name="jobTitle"
                  value={formData.jobTitle}
                    onChange={handleInputChange}
                  placeholder="e.g., Software Engineer"
                  list="job-categories"
                />
                <datalist id="job-categories">
                  {jobCategories.map(job => (
                    <option key={job} value={job} />
                  ))}
                </datalist>
                </div>

                <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                    name="location"
                  value={formData.location}
                    onChange={handleInputChange}
                  placeholder="e.g., San Francisco, CA"
                  list="popular-locations"
                />
                <datalist id="popular-locations">
                  {popularLocations.map(location => (
                    <option key={location} value={location} />
                  ))}
                </datalist>
                </div>

                <div className="form-group">
                <label htmlFor="experience">Years of Experience</label>
                  <select
                  id="experience"
                    name="experience"
                  value={formData.experience}
                    onChange={handleInputChange}
                  >
                  {experienceOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  </select>
                </div>

                <div className="form-group">
                <label htmlFor="company">Company (Optional)</label>
                  <input
                    type="text"
                  id="company"
                    name="company"
                  value={formData.company}
                    onChange={handleInputChange}
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>

              <div className="form-group full-width">
                <label htmlFor="skills">Key Skills (Optional)</label>
                <input
                  type="text"
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="e.g., React, Python, Leadership, etc."
                />
              </div>
            </div>

            <button 
              onClick={handleSearch}
              className="search-btn"
              disabled={isSearching || !formData.jobTitle.trim() || !formData.location.trim()}
            >
              {isSearching ? '🔍 Searching...' : '🔍 Search Salaries'}
                  </button>
                </div>

          <div className="tips-section">
            <h3>💡 Salary Research Tips</h3>
            <div className="tips-grid">
              <div className="tip-card">
                <h4>📊 Multiple Sources</h4>
                <p>Check multiple sources like Glassdoor, PayScale, and LinkedIn for comprehensive data.</p>
              </div>
              <div className="tip-card">
                <h4>🌍 Location Matters</h4>
                <p>Salaries vary significantly by location. Consider cost of living adjustments.</p>
              </div>
              <div className="tip-card">
                <h4>📈 Total Compensation</h4>
                <p>Consider benefits, equity, bonuses, and other perks beyond base salary.</p>
              </div>
              <div className="tip-card">
                <h4>🎯 Negotiate Smartly</h4>
                <p>Use data to support your negotiation, but also consider company size and budget.</p>
              </div>
            </div>
          </div>
                  </div>
      )}

      {/* Results Section */}
      {activeSection === 'results' && searchResults && (
        <div className="results-section">
          <div className="results-header">
            <div className="search-info">
              <h2>📈 Salary Results</h2>
              <p>{searchResults.jobTitle} • {searchResults.location} • {searchResults.experience} years</p>
            </div>
            <button 
              onClick={saveSearch}
              className="save-search-btn"
              disabled={isSaving}
            >
              {isSaving ? '💾 Saving...' : '💾 Save Search'}
            </button>
                  </div>

          <div className="salary-overview">
            <div className="salary-card main">
              <h3>Average Salary</h3>
              <div className="salary-amount">{formatSalary(searchResults.salaryRange.average)}</div>
              <div className="salary-range">
                Range: {formatSalary(searchResults.salaryRange.min)} - {formatSalary(searchResults.salaryRange.max)}
                  </div>
                </div>

                <div className="salary-breakdown">
                  <div className="breakdown-item">
                <span className="label">25th Percentile</span>
                <span className="value">{formatSalary(searchResults.marketData.percentile25)}</span>
                  </div>
                  <div className="breakdown-item">
                <span className="label">50th Percentile (Median)</span>
                <span className="value">{formatSalary(searchResults.marketData.percentile50)}</span>
                  </div>
                  <div className="breakdown-item">
                <span className="label">75th Percentile</span>
                <span className="value">{formatSalary(searchResults.marketData.percentile75)}</span>
              </div>
              <div className="breakdown-item">
                <span className="label">Total Compensation</span>
                <span className="value">{formatSalary(searchResults.marketData.totalCompensation)}</span>
              </div>
                        </div>
                      </div>

          <div className="insights-grid">
            <div className="insights-card">
              <h3>💡 Market Insights</h3>
              <div className="insights-list">
                {searchResults.insights.map((insight, index) => (
                  <div key={index} className="insight-item">
                    <span className="insight-bullet">•</span>
                    <span className="insight-text">{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="actions-card">
              <h3>🎯 Next Steps</h3>
              <div className="action-buttons">
                <button onClick={() => setActiveSection('search')} className="action-btn">
                  🔍 Search Again
                </button>
                <button onClick={() => setActiveSection('history')} className="action-btn">
                  📊 View History
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
            <h2>💾 Saved Searches</h2>
            <div className="history-actions">
                {savedSearches.length > 0 && (
                <button onClick={clearHistory} className="clear-history-btn">
                    🗑️ Clear History
                  </button>
                )}
              </div>
            </div>

          <div className="history-list">
            {savedSearches.length === 0 ? (
              <div className="no-history">
                <div className="no-history-icon">💰</div>
                <h3>No Saved Searches</h3>
                <p>Start searching for salary information to build your research history.</p>
                <button onClick={() => setActiveSection('search')} className="start-searching-btn">
                  🔍 Start Searching
                </button>
              </div>
            ) : (
              <div className="history-items">
                {savedSearches.map((search, index) => (
                  <div key={index} className="history-item">
                    <div className="search-header">
                      <div className="search-title">
                        <h3>{search.jobTitle}</h3>
                        <p>{search.location} • {search.experience} years</p>
                      </div>
                      <div className="search-salary">
                        <span className="average-salary">{formatSalary(search.salaryRange.average)}</span>
                        <span className="salary-range">
                          {formatSalary(search.salaryRange.min)} - {formatSalary(search.salaryRange.max)}
                        </span>
                      </div>
                    </div>

                    <div className="search-details">
                      {search.company && (
                        <div className="detail-item">
                          <span className="label">Company:</span>
                          <span className="value">{search.company}</span>
                        </div>
                      )}
                      {search.skills && (
                        <div className="detail-item">
                          <span className="label">Skills:</span>
                          <span className="value">{search.skills}</span>
                        </div>
                      )}
                      <div className="detail-item">
                        <span className="label">Searched:</span>
                        <span className="value">
                          {new Date(search.savedDate).toLocaleDateString()} at {new Date(search.savedDate).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    <div className="market-data">
                      <div className="data-item">
                        <span className="data-label">Median</span>
                        <span className="data-value">{formatSalary(search.marketData.percentile50)}</span>
                      </div>
                      <div className="data-item">
                        <span className="data-label">75th %ile</span>
                        <span className="data-value">{formatSalary(search.marketData.percentile75)}</span>
                      </div>
                      <div className="data-item">
                        <span className="data-label">Total Comp</span>
                        <span className="data-value">{formatSalary(search.marketData.totalCompensation)}</span>
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

export default SalaryInsights; 