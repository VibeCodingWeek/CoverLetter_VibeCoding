import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { useAuth } from '../../contexts/AuthContext';
import './CoverLetterGenerator.css';

function CoverLetterGenerator({ onBack }) {
  const { dataApi, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    companyName: '',
    jobTitle: '',
    hiringManager: '',
    skills: '',
    experience: '',
    education: '',
    achievements: '',
    whyCompany: '',
    whyPosition: ''
  });

  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('');
  const [activeTab, setActiveTab] = useState('form');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [error, setError] = useState('');

  // Load data from API on component mount
  useEffect(() => {
    const loadCoverLetterData = async () => {
      if (!isAuthenticated) {
        // If not authenticated, try to load from localStorage as fallback
        const savedData = localStorage.getItem('coverLetterData');
        if (savedData) {
          setFormData(JSON.parse(savedData));
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await dataApi.coverLetter.get();
        if (response.data && Object.keys(response.data).length > 0) {
          setFormData(response.data);
          setGeneratedCoverLetter(response.data.generatedContent || '');
        }
      } catch (error) {
        console.error('Error loading cover letter data:', error);
        setError('Failed to load your saved data. You can still use the form.');
        
        // Fallback to localStorage
        const savedData = localStorage.getItem('coverLetterData');
        if (savedData) {
          setFormData(JSON.parse(savedData));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCoverLetterData();
  }, [isAuthenticated, dataApi]);

  // Save data to localStorage when not authenticated (as backup)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('coverLetterData', JSON.stringify(formData));
    }
  }, [formData, isAuthenticated]);

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

  const saveCoverLetterData = async () => {
    if (!isAuthenticated) {
      setError('Please log in to save your data permanently.');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    setError('');

    try {
      const dataToSave = {
        ...formData,
        generatedContent: generatedCoverLetter
      };

      await dataApi.coverLetter.save(dataToSave);
      setSaveMessage('✅ Cover letter data saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving cover letter data:', error);
      setError(`Failed to save data: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const generateCoverLetter = () => {
    const today = new Date().toLocaleDateString();
    
    const coverLetter = `${formData.fullName}
${formData.email}
${formData.phone}
${formData.address}

${today}

${formData.hiringManager ? formData.hiringManager : 'Hiring Manager'}
${formData.companyName}

Dear ${formData.hiringManager || 'Hiring Manager'},

I am writing to express my strong interest in the ${formData.jobTitle} position at ${formData.companyName}. With my background in ${formData.experience}, I am confident that I would be a valuable addition to your team.

${formData.whyCompany ? `What particularly attracts me to ${formData.companyName} is ${formData.whyCompany}` : `I am excited about the opportunity to contribute to ${formData.companyName}'s continued success.`}

${formData.whyPosition ? `I am particularly drawn to this ${formData.jobTitle} role because ${formData.whyPosition}` : `This ${formData.jobTitle} position aligns perfectly with my career goals and expertise.`}

My relevant experience includes:
${formData.experience || 'Please add your relevant experience in the form.'}

Key skills that make me an ideal candidate:
${formData.skills || 'Please add your key skills in the form.'}

Educational background:
${formData.education || 'Please add your educational background in the form.'}

Notable achievements:
${formData.achievements || 'Please add your achievements in the form.'}

I am excited about the opportunity to bring my skills and enthusiasm to ${formData.companyName}. I would welcome the chance to discuss how my background and passion align with your team's needs.

Thank you for considering my application. I look forward to hearing from you soon.

Sincerely,
${formData.fullName}`;

    setGeneratedCoverLetter(coverLetter);
    setActiveTab('preview');
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const maxWidth = pageWidth - (margin * 2);
    
    // Split text into lines that fit the page width
    const lines = doc.splitTextToSize(generatedCoverLetter, maxWidth);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(lines, margin, margin);
    
    const fileName = `cover-letter-${formData.companyName || 'company'}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const clearForm = () => {
    const emptyForm = {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      companyName: '',
      jobTitle: '',
      hiringManager: '',
      skills: '',
      experience: '',
      education: '',
      achievements: '',
      whyCompany: '',
      whyPosition: ''
    };
    setFormData(emptyForm);
    setGeneratedCoverLetter('');
    setActiveTab('form');
    setSaveMessage('');
    setError('');
  };

  if (isLoading) {
    return (
      <div className="cover-letter-generator">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your cover letter data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cover-letter-generator">
      <header className="generator-header">
        <div className="header-content">
          <button onClick={onBack} className="back-button">
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h1>📄 Cover Letter Generator</h1>
            <p>Create professional cover letters tailored to your applications</p>
          </div>
          <div className="header-actions">
            {isAuthenticated && (
              <button 
                onClick={saveCoverLetterData} 
                className="save-btn"
                disabled={isSaving}
              >
                {isSaving ? '💾 Saving...' : '💾 Save Data'}
              </button>
            )}
            <button onClick={clearForm} className="clear-btn">
              🗑️ Clear Form
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

      <div className="generator-tabs">
        <button 
          className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          📝 Fill Details
        </button>
        <button 
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          👁️ Preview Letter
        </button>
      </div>

      {activeTab === 'form' && (
        <div className="form-container">
          <div className="form-grid">
            {/* Personal Information Section */}
            <div className="form-section">
              <h3>👤 Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="City, State, ZIP"
                  />
                </div>
              </div>
            </div>

            {/* Job Information Section */}
            <div className="form-section">
              <h3>🏢 Job Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="companyName">Company Name *</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="jobTitle">Job Title *</label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="Enter job title"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="hiringManager">Hiring Manager Name</label>
                <input
                  type="text"
                  id="hiringManager"
                  name="hiringManager"
                  value={formData.hiringManager}
                  onChange={handleInputChange}
                  placeholder="If known, enter hiring manager's name"
                />
              </div>
            </div>

            {/* Professional Details Section */}
            <div className="form-section full-width">
              <h3>💼 Professional Details</h3>
              <div className="form-group">
                <label htmlFor="skills">Key Skills & Technologies</label>
                <textarea
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  placeholder="List your relevant skills, technologies, and competencies..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="experience">Relevant Experience</label>
                <textarea
                  id="experience"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="Describe your relevant work experience and accomplishments..."
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label htmlFor="education">Education Background</label>
                <textarea
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="Your educational background, degrees, certifications..."
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="achievements">Notable Achievements</label>
                <textarea
                  id="achievements"
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  placeholder="Key achievements, awards, projects, or accomplishments..."
                  rows="3"
                />
              </div>
            </div>

            {/* Motivation Section */}
            <div className="form-section full-width">
              <h3>🎯 Motivation & Interest</h3>
              <div className="form-group">
                <label htmlFor="whyCompany">Why This Company?</label>
                <textarea
                  id="whyCompany"
                  name="whyCompany"
                  value={formData.whyCompany}
                  onChange={handleInputChange}
                  placeholder="What attracts you to this company? (values, mission, products, culture...)"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label htmlFor="whyPosition">Why This Position?</label>
                <textarea
                  id="whyPosition"
                  name="whyPosition"
                  value={formData.whyPosition}
                  onChange={handleInputChange}
                  placeholder="What interests you about this specific role? How does it align with your goals?"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              onClick={generateCoverLetter} 
              className="generate-btn"
              disabled={!formData.fullName || !formData.companyName || !formData.jobTitle}
            >
              ✨ Generate Cover Letter
            </button>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="preview-container">
          {generatedCoverLetter ? (
            <>
              <div className="preview-actions">
                <button onClick={downloadPDF} className="download-btn">
                  📥 Download PDF
                </button>
                <button onClick={() => setActiveTab('form')} className="edit-btn">
                  ✏️ Edit Details
                </button>
              </div>
              <div className="cover-letter-preview">
                <div className="letter-content">
                  {generatedCoverLetter.split('\n').map((line, index) => (
                    <p key={index} className={line.trim() === '' ? 'empty-line' : ''}>
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="no-preview">
              <div className="no-preview-icon">📄</div>
              <h3>No Cover Letter Generated</h3>
              <p>Please fill out the form and click "Generate Cover Letter" to see your preview.</p>
              <button onClick={() => setActiveTab('form')} className="go-to-form-btn">
                📝 Go to Form
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CoverLetterGenerator; 