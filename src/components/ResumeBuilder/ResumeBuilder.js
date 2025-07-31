import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import './ResumeBuilder.css';

function ResumeBuilder({ onBack }) {
  const [activeSection, setActiveSection] = useState('builder');
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  
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

  // Load data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('resumeBuilderData');
    if (saved) {
      setResumeData(JSON.parse(saved));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('resumeBuilderData', JSON.stringify(resumeData));
  }, [resumeData]);

  const updatePersonalInfo = (field, value) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
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
        degree: '',
        school: '',
        location: '',
        graduationDate: '',
        gpa: '',
        description: ''
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

  const addSkill = (skill) => {
    if (skill.trim() && !resumeData.skills.includes(skill.trim())) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skill) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addProject = () => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: Date.now(),
        title: '',
        description: '',
        technologies: '',
        link: ''
      }]
    }));
  };

  const updateProject = (id, field, value) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }));
  };

  const removeProject = (id) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const addCertification = () => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, {
        id: Date.now(),
        name: '',
        issuer: '',
        date: '',
        link: ''
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

  const nextStep = () => {
    if (currentStep < resumeSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPosition = margin;
    
    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(resumeData.personalInfo.fullName || 'Your Name', margin, yPosition);
    yPosition += 10;
    
    // Contact Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contact = [
      resumeData.personalInfo.email,
      resumeData.personalInfo.phone,
      resumeData.personalInfo.address
    ].filter(Boolean).join(' | ');
    
    if (contact) {
      doc.text(contact, margin, yPosition);
      yPosition += 8;
    }
    
    // Summary
    if (resumeData.personalInfo.summary) {
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SUMMARY', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const summaryLines = doc.splitTextToSize(resumeData.personalInfo.summary, 170);
      summaryLines.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
    }
    
    // Experience
    if (resumeData.experience.length > 0) {
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EXPERIENCE', margin, yPosition);
      yPosition += 8;
      
      resumeData.experience.forEach(exp => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${exp.jobTitle} - ${exp.company}`, margin, yPosition);
        yPosition += 6;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, margin, yPosition);
        yPosition += 6;
        
        if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, 170);
          descLines.forEach(line => {
            doc.text(line, margin, yPosition);
            yPosition += 4;
          });
        }
        yPosition += 3;
      });
    }
    
    // Education
    if (resumeData.education.length > 0) {
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUCATION', margin, yPosition);
      yPosition += 8;
      
      resumeData.education.forEach(edu => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = margin;
        }
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${edu.degree} - ${edu.school}`, margin, yPosition);
        yPosition += 6;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(edu.graduationDate, margin, yPosition);
        yPosition += 8;
      });
    }
    
    // Skills
    if (resumeData.skills.length > 0) {
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('SKILLS', margin, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const skillsText = resumeData.skills.join(', ');
      const skillsLines = doc.splitTextToSize(skillsText, 170);
      skillsLines.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
    }
    
    // Generate filename
    const today = new Date().toISOString().split('T')[0];
    const name = resumeData.personalInfo.fullName.replace(/[^a-zA-Z0-9]/g, '_') || 'Resume';
    const filename = `${name}_Resume_${today}.pdf`;
    
    doc.save(filename);
  };

  const clearData = () => {
    setResumeData({
      personalInfo: {
        fullName: '', email: '', phone: '', address: '', linkedin: '', website: '', summary: ''
      },
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: []
    });
    localStorage.removeItem('resumeBuilderData');
  };

  return (
    <div className="resume-builder">
      <header className="App-header">
        <div className="header-content">
          <button className="back-button" onClick={onBack}>
            ← Back to Home
          </button>
          <div className="header-text">
            <h1>📄 Resume Builder</h1>
            <p>Create professional resumes that get you hired</p>
          </div>
        </div>
      </header>

      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeSection === 'builder' ? 'active' : ''}`}
          onClick={() => setActiveSection('builder')}
        >
          🛠️ Build Resume
        </button>
        <button 
          className={`tab-button ${activeSection === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveSection('preview')}
        >
          👁️ Preview
        </button>
        <button 
          className={`tab-button ${activeSection === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveSection('templates')}
        >
          🎨 Templates
        </button>
      </div>

      <main className="main-content">
        {/* Builder Section */}
        {activeSection === 'builder' && (
          <div className="builder-container">
            {/* Progress Steps */}
            <div className="progress-steps">
              {resumeSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                  onClick={() => setCurrentStep(index)}
                >
                  <span className="step-icon">{step.icon}</span>
                  <span className="step-title">{step.title}</span>
                </div>
              ))}
            </div>

            {/* Current Step Content */}
            <div className="step-content">
              {/* Personal Info Step */}
              {currentStep === 0 && (
                <div className="form-section">
                  <h2>Personal Information</h2>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        value={resumeData.personalInfo.fullName}
                        onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={resumeData.personalInfo.email}
                        onChange={(e) => updatePersonalInfo('email', e.target.value)}
                        placeholder="john.doe@email.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        type="tel"
                        value={resumeData.personalInfo.phone}
                        onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                        placeholder="(555) 123-4567"
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
                      <label>LinkedIn</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.linkedin}
                        onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                        placeholder="linkedin.com/in/johndoe"
                      />
                    </div>
                    <div className="form-group">
                      <label>Website/Portfolio</label>
                      <input
                        type="url"
                        value={resumeData.personalInfo.website}
                        onChange={(e) => updatePersonalInfo('website', e.target.value)}
                        placeholder="johndoe.com"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Professional Summary</label>
                    <textarea
                      value={resumeData.personalInfo.summary}
                      onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                      placeholder="Brief professional summary highlighting your key skills and experience..."
                      rows="4"
                    />
                  </div>
                </div>
              )}

              {/* Experience Step */}
              {currentStep === 1 && (
                <div className="form-section">
                  <div className="section-header">
                    <h2>Work Experience</h2>
                    <button className="btn-primary" onClick={addExperience}>
                      + Add Experience
                    </button>
                  </div>
                  
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="experience-card">
                      <div className="card-header">
                        <h3>Experience Entry</h3>
                        <button className="btn-danger" onClick={() => removeExperience(exp.id)}>
                          🗑️ Remove
                        </button>
                      </div>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Job Title *</label>
                          <input
                            type="text"
                            value={exp.jobTitle}
                            onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                            placeholder="Software Developer"
                          />
                        </div>
                        <div className="form-group">
                          <label>Company *</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            placeholder="Tech Company Inc."
                          />
                        </div>
                        <div className="form-group">
                          <label>Location</label>
                          <input
                            type="text"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                            placeholder="San Francisco, CA"
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
                            disabled={exp.current}
                          />
                        </div>
                        <div className="form-group checkbox-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                            />
                            Currently working here
                          </label>
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Job Description</label>
                        <textarea
                          value={exp.description}
                          onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                          placeholder="• Developed and maintained web applications using React and Node.js&#10;• Collaborated with cross-functional teams to deliver high-quality software&#10;• Improved application performance by 30% through code optimization"
                          rows="5"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {resumeData.experience.length === 0 && (
                    <div className="empty-state">
                      <p>No work experience added yet. Click "Add Experience" to get started!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Education Step */}
              {currentStep === 2 && (
                <div className="form-section">
                  <div className="section-header">
                    <h2>Education</h2>
                    <button className="btn-primary" onClick={addEducation}>
                      + Add Education
                    </button>
                  </div>
                  
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="education-card">
                      <div className="card-header">
                        <h3>Education Entry</h3>
                        <button className="btn-danger" onClick={() => removeEducation(edu.id)}>
                          🗑️ Remove
                        </button>
                      </div>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Degree *</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            placeholder="Bachelor of Science in Computer Science"
                          />
                        </div>
                        <div className="form-group">
                          <label>School *</label>
                          <input
                            type="text"
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                            placeholder="University of Technology"
                          />
                        </div>
                        <div className="form-group">
                          <label>Location</label>
                          <input
                            type="text"
                            value={edu.location}
                            onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                            placeholder="Boston, MA"
                          />
                        </div>
                        <div className="form-group">
                          <label>Graduation Date</label>
                          <input
                            type="month"
                            value={edu.graduationDate}
                            onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
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
                      </div>
                      
                      <div className="form-group">
                        <label>Additional Details</label>
                        <textarea
                          value={edu.description}
                          onChange={(e) => updateEducation(edu.id, 'description', e.target.value)}
                          placeholder="Relevant coursework, honors, activities, etc."
                          rows="3"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {resumeData.education.length === 0 && (
                    <div className="empty-state">
                      <p>No education added yet. Click "Add Education" to get started!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Skills Step */}
              {currentStep === 3 && (
                <div className="form-section">
                  <h2>Skills</h2>
                  <div className="skills-input">
                    <input
                      type="text"
                      placeholder="Add a skill (e.g., JavaScript, Project Management)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSkill(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <p className="helper-text">Press Enter to add a skill</p>
                  </div>
                  
                  <div className="skills-list">
                    {resumeData.skills.map((skill, index) => (
                      <div key={index} className="skill-tag">
                        <span>{skill}</span>
                        <button onClick={() => removeSkill(skill)}>×</button>
                      </div>
                    ))}
                  </div>
                  
                  {resumeData.skills.length === 0 && (
                    <div className="empty-state">
                      <p>No skills added yet. Start typing and press Enter to add skills!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Projects Step */}
              {currentStep === 4 && (
                <div className="form-section">
                  <div className="section-header">
                    <h2>Projects</h2>
                    <button className="btn-primary" onClick={addProject}>
                      + Add Project
                    </button>
                  </div>
                  
                  {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="project-card">
                      <div className="card-header">
                        <h3>Project Entry</h3>
                        <button className="btn-danger" onClick={() => removeProject(proj.id)}>
                          🗑️ Remove
                        </button>
                      </div>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Project Title *</label>
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                            placeholder="E-commerce Web Application"
                          />
                        </div>
                        <div className="form-group">
                          <label>Technologies Used</label>
                          <input
                            type="text"
                            value={proj.technologies}
                            onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                            placeholder="React, Node.js, MongoDB"
                          />
                        </div>
                        <div className="form-group">
                          <label>Project Link</label>
                          <input
                            type="url"
                            value={proj.link}
                            onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                            placeholder="https://github.com/username/project"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label>Project Description</label>
                        <textarea
                          value={proj.description}
                          onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                          placeholder="Describe what the project does, your role, and key achievements..."
                          rows="4"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {resumeData.projects.length === 0 && (
                    <div className="empty-state">
                      <p>No projects added yet. Click "Add Project" to showcase your work!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Certifications Step */}
              {currentStep === 5 && (
                <div className="form-section">
                  <div className="section-header">
                    <h2>Certifications</h2>
                    <button className="btn-primary" onClick={addCertification}>
                      + Add Certification
                    </button>
                  </div>
                  
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id} className="certification-card">
                      <div className="card-header">
                        <h3>Certification Entry</h3>
                        <button className="btn-danger" onClick={() => removeCertification(cert.id)}>
                          🗑️ Remove
                        </button>
                      </div>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Certification Name *</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                            placeholder="AWS Certified Developer"
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
                          <label>Date Obtained</label>
                          <input
                            type="month"
                            value={cert.date}
                            onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Credential Link</label>
                          <input
                            type="url"
                            value={cert.link}
                            onChange={(e) => updateCertification(cert.id, 'link', e.target.value)}
                            placeholder="https://credentials.example.com/cert123"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {resumeData.certifications.length === 0 && (
                    <div className="empty-state">
                      <p>No certifications added yet. Click "Add Certification" to add credentials!</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="step-navigation">
              <button 
                className="btn-secondary" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                ← Previous
              </button>
              
              <div className="step-info">
                Step {currentStep + 1} of {resumeSteps.length}
              </div>
              
              <button 
                className="btn-secondary" 
                onClick={nextStep}
                disabled={currentStep === resumeSteps.length - 1}
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Preview Section */}
        {activeSection === 'preview' && (
          <div className="preview-container">
            <div className="preview-actions">
              <button className="btn-primary" onClick={generatePDF}>
                📄 Download PDF
              </button>
              <button className="btn-secondary" onClick={clearData}>
                🗑️ Clear All Data
              </button>
            </div>
            
            <div className="resume-preview">
              <div className="resume-header">
                <h1>{resumeData.personalInfo.fullName || 'Your Name'}</h1>
                <div className="contact-info">
                  {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
                  {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
                  {resumeData.personalInfo.address && <span>{resumeData.personalInfo.address}</span>}
                </div>
              </div>
              
              {resumeData.personalInfo.summary && (
                <div className="resume-section">
                  <h2>Summary</h2>
                  <p>{resumeData.personalInfo.summary}</p>
                </div>
              )}
              
              {resumeData.experience.length > 0 && (
                <div className="resume-section">
                  <h2>Experience</h2>
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="resume-item">
                      <div className="item-header">
                        <h3>{exp.jobTitle} - {exp.company}</h3>
                        <span>{exp.startDate} - {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      {exp.description && <p>{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}
              
              {resumeData.education.length > 0 && (
                <div className="resume-section">
                  <h2>Education</h2>
                  {resumeData.education.map((edu) => (
                    <div key={edu.id} className="resume-item">
                      <div className="item-header">
                        <h3>{edu.degree} - {edu.school}</h3>
                        <span>{edu.graduationDate}</span>
                      </div>
                      {edu.gpa && <p>GPA: {edu.gpa}</p>}
                      {edu.description && <p>{edu.description}</p>}
                    </div>
                  ))}
                </div>
              )}
              
              {resumeData.skills.length > 0 && (
                <div className="resume-section">
                  <h2>Skills</h2>
                  <p>{resumeData.skills.join(', ')}</p>
                </div>
              )}
              
              {resumeData.projects.length > 0 && (
                <div className="resume-section">
                  <h2>Projects</h2>
                  {resumeData.projects.map((proj) => (
                    <div key={proj.id} className="resume-item">
                      <h3>{proj.title}</h3>
                      {proj.technologies && <p><strong>Technologies:</strong> {proj.technologies}</p>}
                      {proj.description && <p>{proj.description}</p>}
                      {proj.link && <p><strong>Link:</strong> {proj.link}</p>}
                    </div>
                  ))}
                </div>
              )}
              
              {resumeData.certifications.length > 0 && (
                <div className="resume-section">
                  <h2>Certifications</h2>
                  {resumeData.certifications.map((cert) => (
                    <div key={cert.id} className="resume-item">
                      <h3>{cert.name}</h3>
                      {cert.issuer && <p>{cert.issuer} - {cert.date}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Section */}
        {activeSection === 'templates' && (
          <div className="templates-container">
            <div className="section-header">
              <h2>Choose a Template</h2>
              <p>Select a design that matches your style and industry</p>
            </div>
            
            <div className="templates-grid">
              {templates.map((template) => (
                <div 
                  key={template.id}
                  className={`template-card ${selectedTemplate === template.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="template-preview">
                    <div className="template-mockup">
                      <div className="mockup-header"></div>
                      <div className="mockup-content">
                        <div className="mockup-line"></div>
                        <div className="mockup-line short"></div>
                        <div className="mockup-line"></div>
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
      </main>
    </div>
  );
}

export default ResumeBuilder; 