import React, { useState } from 'react';
import Homepage from './components/Homepage';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import InterviewPrep from './components/InterviewPrep';
import ResumeBuilder from './components/ResumeBuilder';
import JobTracker from './components/JobTracker';
import SalaryInsights from './components/SalaryInsights';
import NetworkingTips from './components/NetworkingTips';
import './styles/globals.css';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('homepage');

  const navigateToPage = (page) => {
    setCurrentPage(page);
  };

  const goBackToHome = () => {
    setCurrentPage('homepage');
  };

  return (
    <div className="App">
      {currentPage === 'homepage' && (
        <Homepage onNavigate={navigateToPage} />
      )}
      {currentPage === 'cover-letter' && (
        <CoverLetterGenerator onBack={goBackToHome} />
      )}
      {currentPage === 'interview-prep' && (
        <InterviewPrep onBack={goBackToHome} />
      )}
      {currentPage === 'resume-builder' && (
        <ResumeBuilder onBack={goBackToHome} />
      )}
      {currentPage === 'job-tracker' && (
        <JobTracker onBack={goBackToHome} />
      )}
      {currentPage === 'salary-insights' && (
        <SalaryInsights onBack={goBackToHome} />
      )}
      {currentPage === 'networking-tips' && (
        <NetworkingTips onBack={goBackToHome} />
      )}
    </div>
  );
}

export default App;
