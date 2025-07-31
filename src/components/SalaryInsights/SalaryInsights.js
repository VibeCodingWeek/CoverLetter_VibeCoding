import React, { useState, useEffect } from 'react';
import './SalaryInsights.css';

function SalaryInsights({ onBack }) {
  const [activeSection, setActiveSection] = useState('search');
  const [searchData, setSearchData] = useState({
    jobTitle: '',
    location: '',
    experience: '',
    company: ''
  });
  const [savedSearches, setSavedSearches] = useState([]);
  const [compareList, setCompareList] = useState([]);

  // Mock salary data - in real app this would come from an API
  const salaryRanges = {
    'software engineer': {
      entry: { min: 70000, max: 95000, average: 82500 },
      mid: { min: 95000, max: 130000, average: 112500 },
      senior: { min: 130000, max: 180000, average: 155000 }
    },
    'product manager': {
      entry: { min: 80000, max: 110000, average: 95000 },
      mid: { min: 110000, max: 150000, average: 130000 },
      senior: { min: 150000, max: 200000, average: 175000 }
    },
    'data scientist': {
      entry: { min: 75000, max: 105000, average: 90000 },
      mid: { min: 105000, max: 145000, average: 125000 },
      senior: { min: 145000, max: 190000, average: 167500 }
    },
    'ux designer': {
      entry: { min: 60000, max: 85000, average: 72500 },
      mid: { min: 85000, max: 120000, average: 102500 },
      senior: { min: 120000, max: 160000, average: 140000 }
    },
    'marketing manager': {
      entry: { min: 55000, max: 75000, average: 65000 },
      mid: { min: 75000, max: 110000, average: 92500 },
      senior: { min: 110000, max: 150000, average: 130000 }
    }
  };

  const locationMultipliers = {
    'san francisco, ca': 1.4,
    'new york, ny': 1.3,
    'seattle, wa': 1.25,
    'boston, ma': 1.2,
    'los angeles, ca': 1.15,
    'chicago, il': 1.05,
    'austin, tx': 1.1,
    'denver, co': 1.05,
    'atlanta, ga': 0.95,
    'phoenix, az': 0.9,
    'remote': 1.0
  };

  const industryInsights = [
    {
      title: 'Tech Industry Trends',
      icon: '💻',
      insights: [
        'Software engineering salaries have increased 15% year-over-year',
        'Remote work options are now offered by 78% of tech companies',
        'AI/ML roles command 20-30% salary premiums',
        'Stock options are common in 85% of startup positions'
      ]
    },
    {
      title: 'Market Analysis',
      icon: '📊',
      insights: [
        'Entry-level positions are most competitive in major cities',
        'Mid-level professionals see the biggest salary jumps when switching companies',
        'Senior roles often include significant equity compensation',
        'Contract work rates are 25-40% higher than FTE salaries'
      ]
    },
    {
      title: 'Negotiation Tips',
      icon: '💰',
      insights: [
        'Research total compensation, not just base salary',
        'Know your market value before negotiations',
        'Consider benefits, PTO, and work-life balance',
        'Don\'t accept the first offer - negotiate respectfully'
      ]
    }
  ];

  // Load saved data
  useEffect(() => {
    const saved = localStorage.getItem('salarySearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  // Save searches
  useEffect(() => {
    localStorage.setItem('salarySearches', JSON.stringify(savedSearches));
  }, [savedSearches]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  const calculateSalary = () => {
    const jobKey = searchData.jobTitle.toLowerCase();
    const locationKey = searchData.location.toLowerCase();
    const expLevel = searchData.experience;

    if (!salaryRanges[jobKey]) {
      return null;
    }

    const baseSalary = salaryRanges[jobKey][expLevel] || salaryRanges[jobKey]['mid'];
    const locationMultiplier = locationMultipliers[locationKey] || 1.0;

    return {
      min: Math.round(baseSalary.min * locationMultiplier),
      max: Math.round(baseSalary.max * locationMultiplier),
      average: Math.round(baseSalary.average * locationMultiplier),
      baseSalary,
      locationMultiplier
    };
  };

  const saveSalarySearch = () => {
    const result = calculateSalary();
    if (result && searchData.jobTitle && searchData.location) {
      const newSearch = {
        id: Date.now(),
        ...searchData,
        result,
        date: new Date().toISOString()
      };
      setSavedSearches(prev => [newSearch, ...prev.slice(0, 9)]); // Keep last 10
    }
  };

  const addToCompare = (search) => {
    if (compareList.length < 3 && !compareList.find(item => item.id === search.id)) {
      setCompareList(prev => [...prev, search]);
    }
  };

  const removeFromCompare = (id) => {
    setCompareList(prev => prev.filter(item => item.id !== id));
  };

  const clearSavedSearches = () => {
    setSavedSearches([]);
    localStorage.removeItem('salarySearches');
  };

  const salaryResult = calculateSalary();

  return (
    <div className="salary-insights">
      <header className="App-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
          <div className="header-text">
            <h1>💰 Salary Insights</h1>
            <p>Research salary ranges and negotiate with confidence</p>
          </div>
        </div>
      </header>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeSection === 'search' ? 'active' : ''}`}
          onClick={() => setActiveSection('search')}
        >
          🔍 Salary Search
        </button>
        <button 
          className={`tab-button ${activeSection === 'compare' ? 'active' : ''}`}
          onClick={() => setActiveSection('compare')}
        >
          ⚖️ Compare ({compareList.length})
        </button>
        <button 
          className={`tab-button ${activeSection === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveSection('insights')}
        >
          📈 Market Insights
        </button>
        <button 
          className={`tab-button ${activeSection === 'history' ? 'active' : ''}`}
          onClick={() => setActiveSection('history')}
        >
          📚 Search History
        </button>
      </div>

      <main className="main-content">
        {/* Salary Search Section */}
        {activeSection === 'search' && (
          <div className="search-container">
            <div className="search-form">
              <h2>Research Salary Ranges</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title *</label>
                  <select
                    name="jobTitle"
                    value={searchData.jobTitle}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a job title</option>
                    <option value="software engineer">Software Engineer</option>
                    <option value="product manager">Product Manager</option>
                    <option value="data scientist">Data Scientist</option>
                    <option value="ux designer">UX Designer</option>
                    <option value="marketing manager">Marketing Manager</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location *</label>
                  <select
                    name="location"
                    value={searchData.location}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a location</option>
                    <option value="san francisco, ca">San Francisco, CA</option>
                    <option value="new york, ny">New York, NY</option>
                    <option value="seattle, wa">Seattle, WA</option>
                    <option value="boston, ma">Boston, MA</option>
                    <option value="los angeles, ca">Los Angeles, CA</option>
                    <option value="chicago, il">Chicago, IL</option>
                    <option value="austin, tx">Austin, TX</option>
                    <option value="denver, co">Denver, CO</option>
                    <option value="atlanta, ga">Atlanta, GA</option>
                    <option value="phoenix, az">Phoenix, AZ</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Experience Level *</label>
                  <select
                    name="experience"
                    value={searchData.experience}
                    onChange={handleInputChange}
                  >
                    <option value="">Select experience level</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (3-7 years)</option>
                    <option value="senior">Senior Level (8+ years)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Company (Optional)</label>
                  <input
                    type="text"
                    name="company"
                    value={searchData.company}
                    onChange={handleInputChange}
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>
              </div>
            </div>

            {/* Salary Results */}
            {salaryResult && (
              <div className="salary-results">
                <div className="results-header">
                  <h3>Salary Range for {searchData.jobTitle} in {searchData.location}</h3>
                  <button className="btn-primary" onClick={saveSalarySearch}>
                    💾 Save Search
                  </button>
                </div>

                <div className="salary-cards">
                  <div className="salary-card minimum">
                    <div className="salary-label">Minimum</div>
                    <div className="salary-amount">${salaryResult.min.toLocaleString()}</div>
                    <div className="salary-subtitle">25th Percentile</div>
                  </div>

                  <div className="salary-card average">
                    <div className="salary-label">Average</div>
                    <div className="salary-amount">${salaryResult.average.toLocaleString()}</div>
                    <div className="salary-subtitle">Market Average</div>
                  </div>

                  <div className="salary-card maximum">
                    <div className="salary-label">Maximum</div>
                    <div className="salary-amount">${salaryResult.max.toLocaleString()}</div>
                    <div className="salary-subtitle">75th Percentile</div>
                  </div>
                </div>

                <div className="salary-breakdown">
                  <h4>Breakdown</h4>
                  <div className="breakdown-item">
                    <span>Base salary range:</span>
                    <span>${salaryResult.baseSalary.min.toLocaleString()} - ${salaryResult.baseSalary.max.toLocaleString()}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Location adjustment:</span>
                    <span>{salaryResult.locationMultiplier}x ({searchData.location})</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Experience level:</span>
                    <span>{searchData.experience} level</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Compare Section */}
        {activeSection === 'compare' && (
          <div className="compare-container">
            <div className="section-header">
              <h2>Salary Comparison</h2>
              <p>Compare up to 3 salary searches side by side</p>
            </div>

            {compareList.length === 0 ? (
              <div className="empty-state">
                <h3>No Searches to Compare</h3>
                <p>Save some salary searches and add them to comparison to see differences.</p>
              </div>
            ) : (
              <div className="compare-grid">
                {compareList.map((search) => (
                  <div key={search.id} className="compare-card">
                    <div className="compare-header">
                      <h3>{search.jobTitle}</h3>
                      <button 
                        className="remove-btn"
                        onClick={() => removeFromCompare(search.id)}
                      >
                        ×
                      </button>
                    </div>
                    <div className="compare-details">
                      <p><strong>Location:</strong> {search.location}</p>
                      <p><strong>Experience:</strong> {search.experience}</p>
                      <div className="compare-salary">
                        <div className="salary-range">
                          ${search.result.min.toLocaleString()} - ${search.result.max.toLocaleString()}
                        </div>
                        <div className="salary-avg">
                          Avg: ${search.result.average.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Market Insights Section */}
        {activeSection === 'insights' && (
          <div className="insights-container">
            <div className="section-header">
              <h2>Market Insights & Trends</h2>
              <p>Stay informed about salary trends and negotiation strategies</p>
            </div>

            <div className="insights-grid">
              {industryInsights.map((insight, index) => (
                <div key={index} className="insight-card">
                  <div className="insight-header">
                    <span className="insight-icon">{insight.icon}</span>
                    <h3>{insight.title}</h3>
                  </div>
                  <ul className="insight-list">
                    {insight.insights.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="negotiation-guide">
              <h3>💡 Salary Negotiation Guide</h3>
              <div className="guide-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Research Market Rates</h4>
                    <p>Use tools like this to understand industry standards for your role and location.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Document Your Value</h4>
                    <p>List your achievements, skills, and contributions that justify higher compensation.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Practice Your Pitch</h4>
                    <p>Rehearse your negotiation conversation and prepare for common responses.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Negotiate Total Package</h4>
                    <p>Consider base salary, bonuses, benefits, PTO, and growth opportunities.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search History Section */}
        {activeSection === 'history' && (
          <div className="history-container">
            <div className="section-header">
              <h2>Search History</h2>
              <div className="header-actions">
                <p>{savedSearches.length} saved searches</p>
                {savedSearches.length > 0 && (
                  <button className="btn-secondary" onClick={clearSavedSearches}>
                    🗑️ Clear History
                  </button>
                )}
              </div>
            </div>

            {savedSearches.length === 0 ? (
              <div className="empty-state">
                <h3>No Search History</h3>
                <p>Your saved salary searches will appear here.</p>
              </div>
            ) : (
              <div className="history-list">
                {savedSearches.map((search) => (
                  <div key={search.id} className="history-item">
                    <div className="history-header">
                      <div className="history-title">
                        <h3>{search.jobTitle}</h3>
                        <p>{search.location} • {search.experience} level</p>
                      </div>
                      <div className="history-actions">
                        <div className="salary-display">
                          ${search.result.average.toLocaleString()} avg
                        </div>
                        <button 
                          className="btn-compare"
                          onClick={() => addToCompare(search)}
                          disabled={compareList.length >= 3 || compareList.find(item => item.id === search.id)}
                        >
                          + Compare
                        </button>
                      </div>
                    </div>
                    <div className="history-details">
                      <span>Range: ${search.result.min.toLocaleString()} - ${search.result.max.toLocaleString()}</span>
                      <span>Searched: {new Date(search.date).toLocaleDateString()}</span>
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

export default SalaryInsights; 