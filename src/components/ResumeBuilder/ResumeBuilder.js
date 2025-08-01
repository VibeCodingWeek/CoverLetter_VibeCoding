import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { useAuth } from '../../contexts/AuthContext';
import './ResumeBuilder.css';

function ResumeBuilder({ onBack }) {
  const { dataApi, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('builder');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      website: '',
      summary: ''
    },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });

  const resumeSteps = [
    { id: 'personal', title: 'Personal Info', icon: '👤' },
    { id: 'experience', title: 'Experience', icon: '💼' },
    { id: 'education', title: 'Education', icon: '🎓' },
    { id: 'skills', title: 'Skills', icon: '⚡' },
    { id: 'projects', title: 'Projects', icon: '🚀' },
    { id: 'certifications', title: 'Certifications', icon: '📜' }
  ];

  const templates = [
    { id: 'modern', name: 'Modern', description: 'Clean and professional design' },
    { id: 'classic', name: 'Classic', description: 'Traditional and elegant layout' },
    { id: 'creative', name: 'Creative', description: 'Bold and eye-catching design' }
  ];

  // Load data from API on component mount
  useEffect(() => {
    const loadResumeData = async () => {
      if (!isAuthenticated) {
        // If not authenticated, try to load from localStorage as fallback
        const saved = localStorage.getItem('resumeBuilderData');
        if (saved) {
          setResumeData(JSON.parse(saved));
        }
        return;
      }

      setIsLoading(true);
      try {
        const response = await dataApi.resume.get();
        if (response.data && Object.keys(response.data).length > 0) {
          const loadedData = response.data;
          setResumeData({
            personalInfo: loadedData.personalInfo || {
              fullName: '',
              email: '',
              phone: '',
              address: '',
              linkedin: '',
              website: '',
              summary: ''
            },
            experience: loadedData.experience || [],
            education: loadedData.education || [],
            skills: loadedData.skills || [],
            projects: loadedData.projects || [],
            certifications: loadedData.certifications || []
          });
          setSelectedTemplate(loadedData.templateName || 'modern');
        }
      } catch (error) {
        console.error('Error loading resume data:', error);
        setError('Failed to load your saved resume. You can still build a new one.');
        
        // Fallback to localStorage
        const saved = localStorage.getItem('resumeBuilderData');
        if (saved) {
          setResumeData(JSON.parse(saved));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadResumeData();
  }, [isAuthenticated, dataApi]);

  // Save data to localStorage when not authenticated (as backup)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('resumeBuilderData', JSON.stringify(resumeData));
    }
  }, [resumeData, isAuthenticated]);

  const saveResumeData = async () => {
    if (!isAuthenticated) {
      setError('Please log in to save your resume permanently.');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');
    setError('');

    try {
      const dataToSave = {
        ...resumeData,
        templateName: selectedTemplate
      };

      await dataApi.resume.save(dataToSave);
      setSaveMessage('✅ Resume saved successfully!');
      
      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving resume:', error);
      setError(`Failed to save resume: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePersonalInfo = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
    
    // Clear messages when user starts editing
    if (saveMessage) setSaveMessage('');
    if (error) setError('');
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: ''
      }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        institution: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        gpa: ''
      }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = () => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, {
        id: Date.now(),
        name: '',
        category: 'Technical',
        proficiency: 'Intermediate'
      }]
    }));
  };

  const updateSkill = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  const removeSkill = (id) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now(),
        name: '',
        description: '',
        technologies: '',
        url: '',
        startDate: '',
        endDate: ''
      }]
    }));
  };

  const updateProject = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, [field]: value } : project
      )
    }));
  };

  const removeProject = (id) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: Date.now(),
        name: '',
        issuer: '',
        dateEarned: '',
        expiryDate: '',
        credentialUrl: ''
      }]
    }));
  };

  const updateCertification = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (id) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPosition = margin;
    
    // Helper function to add text
    const addText = (text, fontSize = 12, style = 'normal') => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', style);
      doc.text(text, margin, yPosition);
      yPosition += fontSize * 0.5 + 5;
    };
    
    // Add header
    addText(resumeData.personalInfo.fullName, 20, 'bold');
    addText(resumeData.personalInfo.email, 12);
    addText(resumeData.personalInfo.phone, 12);
    addText(resumeData.personalInfo.address, 12);
    
    if (resumeData.personalInfo.linkedin) {
      addText(resumeData.personalInfo.linkedin, 12);
    }
    
    yPosition += 10;
    
    // Summary
    if (resumeData.personalInfo.summary) {
      addText('SUMMARY', 14, 'bold');
      const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, 170);
      summaryLines.forEach(line => addText(line, 10));
      yPosition += 10;
    }
    
    // Experience
    if (resumeData.experience.length > 0) {
      addText('EXPERIENCE', 14, 'bold');
      resumeData.experience.forEach(exp => {
        addText(`${exp.position} at ${exp.company}`, 12, 'bold');
        addText(`${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate}`, 10);
        if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, 170);
          descLines.forEach(line => addText(line, 10));
        }
        yPosition += 5;
      });
    }
    
    // Education
    if (resumeData.education.length > 0) {
      addText('EDUCATION', 14, 'bold');
      resumeData.education.forEach(edu => {
        addText(`${edu.degree} in ${edu.fieldOfStudy}`, 12, 'bold');
        addText(`${edu.institution} - ${edu.endDate}`, 10);
        if (edu.gpa) {
          addText(`GPA: ${edu.gpa}`, 10);
        }
        yPosition += 5;
      });
    }
    
    // Skills
    if (resumeData.skills.length > 0) {
      addText('SKILLS', 14, 'bold');
      const skillsText = resumeData.skills.map(skill => skill.name).join(', ');
      const skillLines = doc.splitTextToSize(skillsText, 170);
      skillLines.forEach(line => addText(line, 10));
    }
    
    const fileName = `resume-${resumeData.personalInfo.fullName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const clearResume = () => {
    if (window.confirm('Are you sure you want to clear all resume data? This cannot be undone.')) {
      setResumeData({
        personalInfo: {
          fullName: '',
          email: '',
          phone: '',
          address: '',
          linkedin: '',
          website: '',
          summary: ''
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: []
      });
      setSelectedTemplate('modern');
      setSaveMessage('');
      setError('');
    }
  };

  if (isLoading) {
    return (
      <div className="resume-builder">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your resume data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resume-builder">
      <header className="builder-header">
        <div className="header-content">
          <button onClick={onBack} className="back-button">
            ← Back to Dashboard
          </button>
          <div className="header-title">
            <h1>📄 Resume Builder</h1>
            <p>Create professional resumes that get you hired</p>
          </div>
          <div className="header-actions">
            {isAuthenticated && (
              <button 
                onClick={saveResumeData} 
                className="save-btn"
                disabled={isSaving}
              >
                {isSaving ? '💾 Saving...' : '💾 Save Resume'}
              </button>
            )}
            <button onClick={exportToPDF} className="export-btn">
              📥 Export PDF
            </button>
            <button onClick={clearResume} className="clear-btn">
              🗑️ Clear All
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

      <div className="builder-tabs">
        <button 
          className={`tab-button ${activeSection === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveSection('builder')}
        >
          ✏️ Builder
        </button>
        <button 
          className={`tab-button ${activeSection === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveSection('templates')}
        >
          🎨 Templates
        </button>
        <button 
          className={`tab-button ${activeSection === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveSection('preview')}
        >
          👁️ Preview
        </button>
      </div>

      {activeSection === 'builder' && (
        <div className="builder-section">
          <div className="builder-navigation">
            <div className="step-indicators">
              {resumeSteps.map((step, index) => (
                <button
                  key={step.id}
                  className={`step-indicator ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(index)}
                >
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-title">{step.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="builder-content">
            {/* Personal Information Step */}
            {currentStep === 0 && (
              <div className="step-content">
                <h2>👤 Personal Information</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Address</label>
                    <input
                      type="text"
                      value={resumeData.personalInfo.address}
                      onChange={(e) => updatePersonalInfo('address', e.target.value)}
                      placeholder="City, State, ZIP"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>LinkedIn Profile</label>
                    <input
                      type="url"
                      value={resumeData.personalInfo.linkedin}
                      onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/yourname"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Website/Portfolio</label>
                    <input
                      type="url"
                      value={resumeData.personalInfo.website}
                      onChange={(e) => updatePersonalInfo('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                
                <div className="form-group full-width">
                  <label>Professional Summary</label>
                  <textarea
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                    placeholder="Brief professional summary highlighting your key qualifications..."
                    rows="4"
                  />
                </div>
              </div>
            )}

            {/* Experience Step */}
            {currentStep === 1 && (
              <div className="step-content">
                <div className="step-header">
                  <h2>💼 Work Experience</h2>
                  <button onClick={addExperience} className="add-btn">
                    ➕ Add Experience
                  </button>
                </div>
                
                {resumeData.experience.length === 0 ? (
                  <div className="empty-section">
                    <p>No work experience added yet. Click "Add Experience" to get started.</p>
                  </div>
                ) : (
                  <div className="items-list">
                    {resumeData.experience.map((exp) => (
                      <div key={exp.id} className="item-card">
                        <div className="item-header">
                          <h3>Work Experience</h3>
                          <button onClick={() => removeExperience(exp.id)} className="remove-btn">
                            🗑️
                          </button>
                        </div>
                        
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Company *</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                              placeholder="Company name"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Position *</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                              placeholder="Job title"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Start Date</label>
                            <input
                              type="month"
                              value={exp.startDate}
                              onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>End Date</label>
                            <input
                              type="month"
                              value={exp.endDate}
                              onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                              disabled={exp.isCurrent}
                            />
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={exp.isCurrent}
                              onChange={(e) => updateExperience(exp.id, 'isCurrent', e.target.checked)}
                            />
                            I currently work here
                          </label>
                        </div>
                        
                        <div className="form-group">
                          <label>Job Description</label>
                          <textarea
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                            rows="4"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Education Step */}
            {currentStep === 2 && (
              <div className="step-content">
                <div className="step-header">
                  <h2>🎓 Education</h2>
                  <button onClick={addEducation} className="add-btn">
                    ➕ Add Education
                  </button>
                </div>
                
                {resumeData.education.length === 0 ? (
                  <div className="empty-section">
                    <p>No education added yet. Click "Add Education" to get started.</p>
                  </div>
                ) : (
                  <div className="items-list">
                    {resumeData.education.map((edu) => (
                      <div key={edu.id} className="item-card">
                        <div className="item-header">
                          <h3>Education</h3>
                          <button onClick={() => removeEducation(edu.id)} className="remove-btn">
                            🗑️
                          </button>
                        </div>
                        
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Institution *</label>
                            <input
                              type="text"
                              value={edu.institution}
                              onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                              placeholder="University name"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Degree *</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                              placeholder="Bachelor's, Master's, etc."
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Field of Study</label>
                            <input
                              type="text"
                              value={edu.fieldOfStudy}
                              onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                              placeholder="Computer Science, Business, etc."
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>GPA (Optional)</label>
                            <input
                              type="text"
                              value={edu.gpa}
                              onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                              placeholder="3.8/4.0"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Start Date</label>
                            <input
                              type="month"
                              value={edu.startDate}
                              onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>End Date</label>
                            <input
                              type="month"
                              value={edu.endDate}
                              onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skills Step */}
            {currentStep === 3 && (
              <div className="step-content">
                <div className="step-header">
                  <h2>⚡ Skills</h2>
                  <button onClick={addSkill} className="add-btn">
                    ➕ Add Skill
                  </button>
                </div>
                
                {resumeData.skills.length === 0 ? (
                  <div className="empty-section">
                    <p>No skills added yet. Click "Add Skill" to get started.</p>
                  </div>
                ) : (
                  <div className="skills-grid">
                    {resumeData.skills.map((skill) => (
                      <div key={skill.id} className="skill-card">
                        <button onClick={() => removeSkill(skill.id)} className="remove-btn">
                          🗑️
                        </button>
                        
                        <div className="form-group">
                          <label>Skill Name</label>
                          <input
                            type="text"
                            value={skill.name}
                            onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                            placeholder="JavaScript, Project Management..."
                          />
                        </div>
                        
                        <div className="form-group">
                          <label>Category</label>
                          <select
                            value={skill.category}
                            onChange={(e) => updateSkill(skill.id, 'category', e.target.value)}
                          >
                            <option value="Technical">Technical</option>
                            <option value="Soft Skills">Soft Skills</option>
                            <option value="Languages">Languages</option>
                            <option value="Tools">Tools</option>
                          </select>
                        </div>
                        
                        <div className="form-group">
                          <label>Proficiency</label>
                          <select
                            value={skill.proficiency}
                            onChange={(e) => updateSkill(skill.id, 'proficiency', e.target.value)}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Projects Step */}
            {currentStep === 4 && (
              <div className="step-content">
                <div className="step-header">
                  <h2>🚀 Projects</h2>
                  <button onClick={addProject} className="add-btn">
                    ➕ Add Project
                  </button>
                </div>
                
                {resumeData.projects.length === 0 ? (
                  <div className="empty-section">
                    <p>No projects added yet. Click "Add Project" to get started.</p>
                  </div>
                ) : (
                  <div className="items-list">
                    {resumeData.projects.map((project) => (
                      <div key={project.id} className="item-card">
                        <div className="item-header">
                          <h3>Project</h3>
                          <button onClick={() => removeProject(project.id)} className="remove-btn">
                            🗑️
                          </button>
                        </div>
                        
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Project Name *</label>
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                              placeholder="Project name"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Technologies Used</label>
                            <input
                              type="text"
                              value={project.technologies}
                              onChange={(e) => updateProject(project.id, 'technologies', e.target.value)}
                              placeholder="React, Node.js, MongoDB..."
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Project URL</label>
                            <input
                              type="url"
                              value={project.url}
                              onChange={(e) => updateProject(project.id, 'url', e.target.value)}
                              placeholder="https://github.com/yourname/project"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Start Date</label>
                            <input
                              type="month"
                              value={project.startDate}
                              onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>End Date</label>
                            <input
                              type="month"
                              value={project.endDate}
                              onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="form-group">
                          <label>Project Description</label>
                          <textarea
                            value={project.description}
                            onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                            placeholder="Describe the project, your role, and key achievements..."
                            rows="4"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Certifications Step */}
            {currentStep === 5 && (
              <div className="step-content">
                <div className="step-header">
                  <h2>📜 Certifications</h2>
                  <button onClick={addCertification} className="add-btn">
                    ➕ Add Certification
                  </button>
                </div>
                
                {resumeData.certifications.length === 0 ? (
                  <div className="empty-section">
                    <p>No certifications added yet. Click "Add Certification" to get started.</p>
                  </div>
                ) : (
                  <div className="items-list">
                    {resumeData.certifications.map((cert) => (
                      <div key={cert.id} className="item-card">
                        <div className="item-header">
                          <h3>Certification</h3>
                          <button onClick={() => removeCertification(cert.id)} className="remove-btn">
                            🗑️
                          </button>
                        </div>
                        
                        <div className="form-grid">
                          <div className="form-group">
                            <label>Certification Name *</label>
                            <input
                              type="text"
                              value={cert.name}
                              onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                              placeholder="AWS Certified Solutions Architect"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Issuing Organization</label>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                              placeholder="Amazon Web Services"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Date Earned</label>
                            <input
                              type="month"
                              value={cert.dateEarned}
                              onChange={(e) => updateCertification(cert.id, 'dateEarned', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>Expiry Date (if applicable)</label>
                            <input
                              type="month"
                              value={cert.expiryDate}
                              onChange={(e) => updateCertification(cert.id, 'expiryDate', e.target.value)}
                            />
                          </div>
                          
                          <div className="form-group full-width">
                            <label>Credential URL</label>
                            <input
                              type="url"
                              value={cert.credentialUrl}
                              onChange={(e) => updateCertification(cert.id, 'credentialUrl', e.target.value)}
                              placeholder="https://credentials.example.com/cert/123"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="step-navigation">
              <button 
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="nav-btn prev-btn"
              >
                ← Previous
              </button>
              
              <button 
                onClick={() => setCurrentStep(Math.min(resumeSteps.length - 1, currentStep + 1))}
                disabled={currentStep === resumeSteps.length - 1}
                className="nav-btn next-btn"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'templates' && (
        <div className="templates-section">
          <h2>🎨 Choose Your Template</h2>
          <div className="templates-grid">
            {templates.map(template => (
              <div 
                key={template.id} 
                className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <div className="template-preview">
                  <div className={`template-demo ${template.id}`}>
                    <div className="demo-header"></div>
                    <div className="demo-content">
                      <div className="demo-line"></div>
                      <div className="demo-line short"></div>
                      <div className="demo-line"></div>
                    </div>
                  </div>
                </div>
                <div className="template-info">
                  <h3>{template.name}</h3>
                  <p>{template.description}</p>
                  {selectedTemplate === template.id && (
                    <span className="selected-badge">✓ Selected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'preview' && (
        <div className="preview-section">
          <div className="preview-actions">
            <button onClick={exportToPDF} className="export-btn">
              📥 Export PDF
            </button>
            <button onClick={() => setActiveSection('builder')} className="edit-btn">
              ✏️ Edit Resume
            </button>
          </div>
          
          <div className="resume-preview">
            <div className={`resume-document ${selectedTemplate}`}>
              {/* Resume Header */}
              <div className="resume-header">
                <h1>{resumeData.personalInfo.fullName || 'Your Name'}</h1>
                <div className="contact-info">
                  {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                  {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                  {resumeData.personalInfo.address && <span>{resumeData.personalInfo.address}</span>}
                  {resumeData.personalInfo.linkedin && (
                    <span>
                      <a href={resumeData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                        LinkedIn
                      </a>
                    </span>
                  )}
                  {resumeData.personalInfo.website && (
                    <span>
                      <a href={resumeData.personalInfo.website} target="_blank" rel="noopener noreferrer">
                        Portfolio
                      </a>
                    </span>
                  )}
                </div>
              </div>

              {/* Professional Summary */}
              {resumeData.personalInfo.summary && (
                <div className="resume-section">
                  <h2>Professional Summary</h2>
                  <p>{resumeData.personalInfo.summary}</p>
                </div>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <div className="resume-section">
                  <h2>Experience</h2>
                  {resumeData.experience.map(exp => (
                    <div key={exp.id} className="resume-item">
                      <div className="item-header">
                        <h3>{exp.position}</h3>
                        <span className="company">{exp.company}</span>
                      </div>
                      <div className="item-meta">
                        <span className="date-range">
                          {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.description && <p className="item-description">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {resumeData.education.length > 0 && (
                <div className="resume-section">
                  <h2>Education</h2>
                  {resumeData.education.map(edu => (
                    <div key={edu.id} className="resume-item">
                      <div className="item-header">
                        <h3>{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</h3>
                        <span className="company">{edu.institution}</span>
                      </div>
                      <div className="item-meta">
                        <span className="date-range">{edu.startDate} - {edu.endDate}</span>
                        {edu.gpa && <span className="gpa">GPA: {edu.gpa}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resumeData.skills.length > 0 && (
                <div className="resume-section">
                  <h2>Skills</h2>
                  <div className="skills-list">
                    {resumeData.skills.map(skill => (
                      <span key={skill.id} className="skill-tag">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {resumeData.projects.length > 0 && (
                <div className="resume-section">
                  <h2>Projects</h2>
                  {resumeData.projects.map(project => (
                    <div key={project.id} className="resume-item">
                      <div className="item-header">
                        <h3>{project.name}</h3>
                        {project.url && (
                          <a href={project.url} target="_blank" rel="noopener noreferrer" className="project-link">
                            View Project
                          </a>
                        )}
                      </div>
                      <div className="item-meta">
                        {project.startDate && (
                          <span className="date-range">
                            {project.startDate} - {project.endDate || 'Present'}
                          </span>
                        )}
                        {project.technologies && (
                          <span className="technologies">{project.technologies}</span>
                        )}
                      </div>
                      {project.description && <p className="item-description">{project.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Certifications */}
              {resumeData.certifications.length > 0 && (
                <div className="resume-section">
                  <h2>Certifications</h2>
                  {resumeData.certifications.map(cert => (
                    <div key={cert.id} className="resume-item">
                      <div className="item-header">
                        <h3>{cert.name}</h3>
                        <span className="company">{cert.issuer}</span>
                      </div>
                      <div className="item-meta">
                        <span className="date-range">
                          {cert.dateEarned} {cert.expiryDate && `- ${cert.expiryDate}`}
                        </span>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" className="credential-link">
                            View Credential
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumeBuilder; 