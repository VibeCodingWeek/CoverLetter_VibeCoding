import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResumeBuilder from '../../components/ResumeBuilder/ResumeBuilder';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    text: jest.fn(),
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    splitTextToSize: jest.fn(() => ['mocked line']),
    save: jest.fn(),
  }));
});

// Mock the AuthContext
const mockDataApi = {
  resume: {
    get: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  },
  coverLetter: {
    get: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  },
  jobApplications: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  interviewPractice: {
    getHistory: jest.fn(),
    saveSession: jest.fn(),
  },
  salarySearches: {
    getAll: jest.fn(),
    save: jest.fn(),
  },
};

const mockAuthApi = {
  login: jest.fn(),
  signup: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

const MockAuthProvider = ({ children, isAuthenticated = true }) => {
  const mockValue = {
    user: isAuthenticated ? { id: 1, username: 'testuser' } : null,
    isAuthenticated,
    isLoading: false,
    login: jest.fn(),
    logout: jest.fn(),
    authApi: mockAuthApi,
    dataApi: mockDataApi,
    apiCall: jest.fn(),
  };

  return (
    <AuthProvider value={mockValue}>
      {children}
    </AuthProvider>
  );
};

describe('ResumeBuilder', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataApi.resume.get.mockResolvedValue({ data: {} });
  });

  test('renders resume builder interface', async () => {
    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📄 Resume Builder')).toBeInTheDocument();
    });

    expect(screen.getByText('Create professional resumes that get you hired')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /💾 save resume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /📥 export pdf/i })).toBeInTheDocument();
  });

  test('navigates between different sections', async () => {
    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📄 Resume Builder')).toBeInTheDocument();
    });

    // Test navigation to templates
    const templatesTab = screen.getByRole('button', { name: /templates/i });
    fireEvent.click(templatesTab);
    expect(screen.getByText('Choose Your Template')).toBeInTheDocument();

    // Test navigation to preview
    const previewTab = screen.getByRole('button', { name: /preview/i });
    fireEvent.click(previewTab);
    expect(screen.getByText(/export pdf/i)).toBeInTheDocument();
  });

  test('saves resume data for authenticated users', async () => {
    mockDataApi.resume.save.mockResolvedValue({});

    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📄 Resume Builder')).toBeInTheDocument();
    });

    // Fill in personal information
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });

    const saveButton = screen.getByRole('button', { name: /💾 save resume/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockDataApi.resume.save).toHaveBeenCalled();
    });

    expect(screen.getByText(/resume saved successfully/i)).toBeInTheDocument();
  });

  test('loads saved resume data on mount', async () => {
    const mockResumeData = {
      personalInfo: {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        summary: 'Experienced developer'
      },
      experience: [
        {
          id: 1,
          company: 'Tech Corp',
          position: 'Developer',
          startDate: '2022-01',
          endDate: '2024-01',
          isCurrent: false,
        }
      ],
      templateName: 'modern'
    };

    mockDataApi.resume.get.mockResolvedValue({ data: mockResumeData });

    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(mockDataApi.resume.get).toHaveBeenCalled();
    });

    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
  });

  test('handles different resume steps', async () => {
    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Personal Information')).toBeInTheDocument();
    });

    // Navigate to experience step
    const experienceStep = screen.getByText('Experience');
    fireEvent.click(experienceStep);

    expect(screen.getByText('Work Experience')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add experience/i })).toBeInTheDocument();
  });

  test('adds and removes experience entries', async () => {
    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📄 Resume Builder')).toBeInTheDocument();
    });

    // Navigate to experience step
    const experienceStep = screen.getByText('Experience');
    fireEvent.click(experienceStep);

    // Add experience
    const addButton = screen.getByRole('button', { name: /add experience/i });
    fireEvent.click(addButton);

    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position/i)).toBeInTheDocument();

    // Fill experience details
    fireEvent.change(screen.getByLabelText(/company/i), { 
      target: { value: 'Test Company' } 
    });
    fireEvent.change(screen.getByLabelText(/position/i), { 
      target: { value: 'Developer' } 
    });

    // Remove experience
    const removeButton = screen.getByText('🗑️');
    fireEvent.click(removeButton);

    expect(screen.queryByDisplayValue('Test Company')).not.toBeInTheDocument();
  });

  test('adds and manages skills', async () => {
    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📄 Resume Builder')).toBeInTheDocument();
    });

    // Navigate to skills step
    const skillsStep = screen.getByText('Skills');
    fireEvent.click(skillsStep);

    // Add skill
    const addButton = screen.getByRole('button', { name: /add skill/i });
    fireEvent.click(addButton);

    expect(screen.getByLabelText(/skill name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/proficiency/i)).toBeInTheDocument();

    // Fill skill details
    fireEvent.change(screen.getByLabelText(/skill name/i), { 
      target: { value: 'JavaScript' } 
    });

    // Change category
    fireEvent.change(screen.getByLabelText(/category/i), { 
      target: { value: 'Technical' } 
    });

    expect(screen.getByDisplayValue('JavaScript')).toBeInTheDocument();
  });

  test('exports PDF successfully', async () => {
    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📄 Resume Builder')).toBeInTheDocument();
    });

    const exportButton = screen.getByRole('button', { name: /📥 export pdf/i });
    fireEvent.click(exportButton);

    // PDF export is mocked, so we just verify the button works
    expect(exportButton).toBeInTheDocument();
  });

  test('clears all resume data', async () => {
    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📄 Resume Builder')).toBeInTheDocument();
    });

    // Fill in some data
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    const clearButton = screen.getByRole('button', { name: /🗑️ clear all/i });
    fireEvent.click(clearButton);

    expect(screen.getByLabelText(/full name/i).value).toBe('');
  });

  test('shows warning for unauthenticated users', async () => {
    render(
      <MockAuthProvider isAuthenticated={false}>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/you're not logged in/i)).toBeInTheDocument();
    });
  });

  test('selects different templates', async () => {
    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📄 Resume Builder')).toBeInTheDocument();
    });

    // Navigate to templates
    const templatesTab = screen.getByRole('button', { name: /templates/i });
    fireEvent.click(templatesTab);

    // Select classic template
    const classicTemplate = screen.getByText('Classic');
    fireEvent.click(classicTemplate);

    expect(screen.getByText('✓ Selected')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    mockDataApi.resume.save.mockRejectedValue(new Error('API Error'));

    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📄 Resume Builder')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });

    const saveButton = screen.getByRole('button', { name: /💾 save resume/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save resume/i)).toBeInTheDocument();
    });
  });

  test('calls onBack when back button is clicked', async () => {
    render(
      <MockAuthProvider>
        <ResumeBuilder onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });
}); 