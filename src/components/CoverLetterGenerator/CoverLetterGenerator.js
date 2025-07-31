import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './CoverLetterGenerator.css';

function CoverLetterGenerator({ onBack }) {
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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('coverLetterData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  // Save data to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('coverLetterData', JSON.stringify(formData));
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateCoverLetter = () => {
    const today = new Date().toLocaleDateString();
    
    const coverLetter = `${formData.fullName}
${formData.email}
${formData.phone}
${formData.address}

${today}

${formData.hiringManager ? `Dear ${formData.hiringManager},` : 'Dear Hiring Manager,'}

I am writing to express my strong interest in the ${formData.jobTitle} position at ${formData.companyName}. ${formData.whyCompany ? `I am particularly drawn to ${formData.companyName} because ${formData.whyCompany}` : 'Your company has an excellent reputation in the industry, and I believe my skills would be a valuable addition to your team.'}

With ${formData.experience}, I have developed a comprehensive skill set that aligns perfectly with the requirements of this role. My key skills include: ${formData.skills}. ${formData.achievements ? `Some of my notable achievements include: ${formData.achievements}.` : ''}

${formData.education ? `My educational background includes ${formData.education}, which has provided me with a strong foundation in relevant concepts and methodologies.` : ''}

${formData.whyPosition ? `I am particularly excited about this position because ${formData.whyPosition}` : 'I am excited about the opportunity to contribute to your team and help drive the company\'s continued success.'} I am confident that my passion for excellence and proven track record make me an ideal candidate for this role.

Thank you for considering my application. I look forward to the opportunity to discuss how my experience and enthusiasm can contribute to ${formData.companyName}'s continued success.

Sincerely,
${formData.fullName}`;

    setGeneratedCoverLetter(coverLetter);
    setActiveTab('preview');
  };

  const clearForm = () => {
    setFormData({
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
    setGeneratedCoverLetter('');
    localStorage.removeItem('coverLetterData');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCoverLetter);
    alert('Cover letter copied to clipboard!');
  };

  const downloadPDF = () => {
    if (!generatedCoverLetter) return;
    
    const doc = new jsPDF();
    
    // Set font
    doc.setFont('times', 'normal');
    doc.setFontSize(12);
    
    // Split the cover letter into lines that fit the page width
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxLineWidth = pageWidth - (margin * 2);
    
    // Split text into lines
    const lines = doc.splitTextToSize(generatedCoverLetter, maxLineWidth);
    
    // Add text to PDF
    let yPosition = margin;
    lines.forEach((line) => {
      if (yPosition > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6; // Line spacing
    });
    
    // Generate filename with company name and date
    const today = new Date().toISOString().split('T')[0];
    const companyName = formData.companyName.replace(/[^a-zA-Z0-9]/g, '_') || 'Company';
    const filename = `Cover_Letter_${companyName}_${today}.pdf`;
    
    // Download the PDF
    doc.save(filename);
  };

  return (
    <div className="cover-letter-generator">
      <header className="App-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
          <div className="header-text">
            <h1>🎯 Cover Letter Generator</h1>
            <p>Create professional cover letters in minutes</p>
          </div>
        </div>
      </header>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'form' ? 'active' : ''}`}
          onClick={() => setActiveTab('form')}
        >
          📝 Fill Information
        </button>
        <button 
          className={`tab-button ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          👁️ Preview Cover Letter
        </button>
      </div>

      <main className="main-content">
        {activeTab === 'form' && (
          <div className="form-container">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="form-section">
                <h2>Personal Information</h2>
                <div className="form-grid">
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
                    <label htmlFor="email">Email *</label>
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
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="(123) 456-7890"
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

              <div className="form-section">
                <h2>Job Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="companyName">Company Name *</label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Company you're applying to"
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
                      placeholder="Position you're applying for"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="hiringManager">Hiring Manager</label>
                    <input
                      type="text"
                      id="hiringManager"
                      name="hiringManager"
                      value={formData.hiringManager}
                      onChange={handleInputChange}
                      placeholder="Mr. John Smith (if known)"
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h2>Professional Details</h2>
                <div className="form-group">
                  <label htmlFor="skills">Skills & Technologies *</label>
                  <textarea
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="List your relevant skills, technologies, and competencies (e.g., JavaScript, React, Project Management, Data Analysis)"
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="experience">Experience *</label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Describe your relevant work experience (e.g., 3 years as a Software Developer, 5+ years in Marketing)"
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="education">Education</label>
                  <textarea
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    placeholder="Your educational background (e.g., Bachelor's in Computer Science from XYZ University)"
                    rows="2"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="achievements">Key Achievements</label>
                  <textarea
                    id="achievements"
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleInputChange}
                    placeholder="Notable accomplishments, awards, or projects that demonstrate your value"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-section">
                <h2>Personalization</h2>
                <div className="form-group">
                  <label htmlFor="whyCompany">Why This Company?</label>
                  <textarea
                    id="whyCompany"
                    name="whyCompany"
                    value={formData.whyCompany}
                    onChange={handleInputChange}
                    placeholder="What interests you about this specific company? (Research their values, mission, recent news)"
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
                    placeholder="What excites you about this specific role? How does it align with your career goals?"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={clearForm}>
                  🗑️ Clear Form
                </button>
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={generateCoverLetter}
                  disabled={!formData.fullName || !formData.email || !formData.companyName || !formData.jobTitle || !formData.skills || !formData.experience}
                >
                  ✨ Generate Cover Letter
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="preview-container">
            {generatedCoverLetter ? (
              <div>
                <div className="preview-actions">
                  <button className="btn-primary" onClick={copyToClipboard}>
                    📋 Copy to Clipboard
                  </button>
                  <button className="btn-primary" onClick={downloadPDF}>
                    📄 Download PDF
                  </button>
                  <button className="btn-secondary" onClick={() => setActiveTab('form')}>
                    ✏️ Edit Information
                  </button>
                </div>
                <div className="cover-letter-preview">
                  <pre>{generatedCoverLetter}</pre>
                </div>
              </div>
            ) : (
              <div className="no-preview">
                <h3>No Cover Letter Generated</h3>
                <p>Please fill out the form and generate a cover letter first.</p>
                <button className="btn-primary" onClick={() => setActiveTab('form')}>
                  📝 Go to Form
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default CoverLetterGenerator; 