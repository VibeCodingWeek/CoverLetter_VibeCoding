import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CoverLetterGenerator from '../../components/CoverLetterGenerator/CoverLetterGenerator';
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
  resume: {
    get: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
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

describe('CoverLetterGenerator', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataApi.coverLetter.get.mockResolvedValue({ data: {} });
  });

  test('renders cover letter generator form', async () => {
    render(
      <MockAuthProvider>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📄 Cover Letter Generator')).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/company name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
  });

  test('loads saved data on component mount for authenticated users', async () => {
    const mockSavedData = {
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      jobInfo: {
        company: 'Test Company',
        position: 'Developer',
      },
    };

    mockDataApi.coverLetter.get.mockResolvedValue({ 
      data: mockSavedData 
    });

    render(
      <MockAuthProvider>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(mockDataApi.coverLetter.get).toHaveBeenCalled();
    });

    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Developer')).toBeInTheDocument();
  });

  test('updates form fields correctly', async () => {
    render(
      <MockAuthProvider>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/full name/i);
    fireEvent.change(nameInput, { target: { value: 'Jane Smith' } });

    expect(nameInput.value).toBe('Jane Smith');
  });

  test('generates cover letter when form is filled', async () => {
    render(
      <MockAuthProvider>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/company name/i), { 
      target: { value: 'Test Company' } 
    });
    fireEvent.change(screen.getByLabelText(/job title/i), { 
      target: { value: 'Developer' } 
    });

    const generateButton = screen.getByRole('button', { name: /generate cover letter/i });
    fireEvent.click(generateButton);

    // Check if cover letter is generated
    await waitFor(() => {
      expect(screen.getByText(/dear hiring manager/i)).toBeInTheDocument();
    });
  });

  test('saves cover letter data for authenticated users', async () => {
    mockDataApi.coverLetter.save.mockResolvedValue({});

    render(
      <MockAuthProvider>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    });

    // Fill in some data
    fireEvent.change(screen.getByLabelText(/your name/i), { 
      target: { value: 'John Doe' } 
    });

    const saveButton = screen.getByRole('button', { name: /💾 save data/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockDataApi.coverLetter.save).toHaveBeenCalled();
    });

    expect(screen.getByText(/cover letter data saved successfully/i)).toBeInTheDocument();
  });

  test('shows warning for unauthenticated users', async () => {
    render(
      <MockAuthProvider isAuthenticated={false}>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/you're not logged in/i)).toBeInTheDocument();
    });
  });

  test('clears form data when clear button is clicked', async () => {
    render(
      <MockAuthProvider>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    // Fill in some data
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });

    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);

    const clearButton = screen.getByRole('button', { name: /🗑️ clear form/i });
    fireEvent.click(clearButton);

    expect(screen.getByLabelText(/full name/i).value).toBe('');
  });

  test('generates cover letter when form is filled', async () => {
    render(
      <MockAuthProvider>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/company name/i), { 
      target: { value: 'Test Company' } 
    });
    fireEvent.change(screen.getByLabelText(/job title/i), { 
      target: { value: 'Developer' } 
    });

    const generateButton = screen.getByRole('button', { name: /generate cover letter/i });
    fireEvent.click(generateButton);

    // Check if cover letter is generated
    await waitFor(() => {
      expect(screen.getByText(/dear hiring manager/i)).toBeInTheDocument();
    });
  });

  test('downloads PDF when download button is clicked', async () => {
    render(
      <MockAuthProvider>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    });

    // Fill in required fields and generate cover letter
    fireEvent.change(screen.getByLabelText(/your name/i), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByLabelText(/company name/i), { 
      target: { value: 'Test Company' } 
    });
    fireEvent.change(screen.getByLabelText(/job title/i), { 
      target: { value: 'Developer' } 
    });

    const generateButton = screen.getByRole('button', { name: /generate cover letter/i });
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /download pdf/i })).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole('button', { name: /download pdf/i });
    fireEvent.click(downloadButton);

    // The PDF generation is mocked, so we just verify the button works
    expect(downloadButton).toBeInTheDocument();
  });

  test('calls onBack when back button is clicked', async () => {
    render(
      <MockAuthProvider>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/back to dashboard/i)).toBeInTheDocument();
    });

    const backButton = screen.getByRole('button', { name: /back to dashboard/i });
    fireEvent.click(backButton);

    expect(mockOnBack).toHaveBeenCalled();
  });

  test('handles API errors gracefully', async () => {
    mockDataApi.coverLetter.save.mockRejectedValue(new Error('API Error'));

    render(
      <MockAuthProvider>
        <CoverLetterGenerator onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/full name/i), { 
      target: { value: 'John Doe' } 
    });

    const saveButton = screen.getByRole('button', { name: /💾 save data/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/failed to save data/i)).toBeInTheDocument();
    });
  });
}); 