import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import JobTracker from '../../components/JobTracker/JobTracker';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the AuthContext
const mockDataApi = {
  jobApplications: {
    getAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  coverLetter: {
    get: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
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

describe('JobTracker', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataApi.jobApplications.getAll.mockResolvedValue({ applications: [] });
  });

  test('renders job tracker dashboard', async () => {
    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('📊 Job Application Tracker')).toBeInTheDocument();
    });

    expect(screen.getByText('Manage and track your job applications efficiently')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add application/i })).toBeInTheDocument();
  });

  test('loads applications on component mount for authenticated users', async () => {
    const mockApplications = [
      {
        id: 1,
        company: 'Google',
        position: 'Software Engineer',
        status: 'applied',
        dateApplied: '2024-01-15',
        location: 'Mountain View, CA',
      },
      {
        id: 2,
        company: 'Microsoft',
        position: 'Frontend Developer',
        status: 'interview',
        dateApplied: '2024-01-10',
        location: 'Seattle, WA',
      },
    ];

    mockDataApi.jobApplications.getAll.mockResolvedValue({ 
      applications: mockApplications 
    });

    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(mockDataApi.jobApplications.getAll).toHaveBeenCalled();
    });

    expect(screen.getByText('Google')).toBeInTheDocument();
    expect(screen.getByText('Microsoft')).toBeInTheDocument();
    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
  });

  test('opens add application form when add button is clicked', async () => {
    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add application/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add application/i });
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Application')).toBeInTheDocument();
    expect(screen.getByLabelText(/company/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/position/i)).toBeInTheDocument();
  });

  test('validates required fields when adding application', async () => {
    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add application/i })).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: /add application/i });
    fireEvent.click(addButton);

    const submitButton = screen.getByRole('button', { name: /add application/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Company and position are required')).toBeInTheDocument();
    });
  });

  test('creates new application successfully', async () => {
    mockDataApi.jobApplications.create.mockResolvedValue({ id: 3 });

    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add application/i })).toBeInTheDocument();
    });

    // Open form
    const addButton = screen.getByRole('button', { name: /add application/i });
    fireEvent.click(addButton);

    // Fill form
    fireEvent.change(screen.getByLabelText(/company/i), { 
      target: { value: 'Apple' } 
    });
    fireEvent.change(screen.getByLabelText(/position/i), { 
      target: { value: 'iOS Developer' } 
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /add application/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockDataApi.jobApplications.create).toHaveBeenCalledWith({
        company: 'Apple',
        position: 'iOS Developer',
        location: '',
        salary: '',
        jobUrl: '',
        status: 'applied',
        dateApplied: expect.any(String),
        followUpDate: '',
        notes: '',
        contactPerson: '',
        contactEmail: ''
      });
    });

    expect(screen.getByText(/job application added successfully/i)).toBeInTheDocument();
  });

  test('edits existing application', async () => {
    const mockApplications = [
      {
        id: 1,
        company: 'Google',
        position: 'Software Engineer',
        status: 'applied',
        dateApplied: '2024-01-15',
        location: 'Mountain View, CA',
      },
    ];

    mockDataApi.jobApplications.getAll.mockResolvedValue({ 
      applications: mockApplications 
    });
    mockDataApi.jobApplications.update.mockResolvedValue({});

    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    // Click edit button
    const editButton = screen.getByTitle('Edit Application');
    fireEvent.click(editButton);

    // Update company name
    const companyInput = screen.getByDisplayValue('Google');
    fireEvent.change(companyInput, { target: { value: 'Google LLC' } });

    // Submit form
    const updateButton = screen.getByRole('button', { name: /update application/i });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(mockDataApi.jobApplications.update).toHaveBeenCalledWith(1, expect.objectContaining({
        company: 'Google LLC',
      }));
    });

    expect(screen.getByText(/job application updated successfully/i)).toBeInTheDocument();
  });

  test('deletes application with confirmation', async () => {
    const mockApplications = [
      {
        id: 1,
        company: 'Google',
        position: 'Software Engineer',
        status: 'applied',
        dateApplied: '2024-01-15',
      },
    ];

    mockDataApi.jobApplications.getAll.mockResolvedValue({ 
      applications: mockApplications 
    });
    mockDataApi.jobApplications.delete.mockResolvedValue({});

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    const deleteButton = screen.getByTitle('Delete Application');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDataApi.jobApplications.delete).toHaveBeenCalledWith(1);
    });

    expect(screen.getByText(/job application deleted successfully/i)).toBeInTheDocument();
  });

  test('filters applications by status', async () => {
    const mockApplications = [
      {
        id: 1,
        company: 'Google',
        position: 'Software Engineer',
        status: 'applied',
        dateApplied: '2024-01-15',
      },
      {
        id: 2,
        company: 'Microsoft',
        position: 'Frontend Developer',
        status: 'interview',
        dateApplied: '2024-01-10',
      },
    ];

    mockDataApi.jobApplications.getAll.mockResolvedValue({ 
      applications: mockApplications 
    });

    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
      expect(screen.getByText('Microsoft')).toBeInTheDocument();
    });

    // Filter by interview status
    const filterSelect = screen.getByDisplayValue(/all status/i);
    fireEvent.change(filterSelect, { target: { value: 'interview' } });

    // Google should be hidden, Microsoft should be visible
    expect(screen.queryByText('Google')).not.toBeInTheDocument();
    expect(screen.getByText('Microsoft')).toBeInTheDocument();
  });

  test('sorts applications by company name', async () => {
    const mockApplications = [
      {
        id: 1,
        company: 'Microsoft',
        position: 'Frontend Developer',
        status: 'applied',
        dateApplied: '2024-01-15',
      },
      {
        id: 2,
        company: 'Apple',
        position: 'iOS Developer',
        status: 'applied',
        dateApplied: '2024-01-10',
      },
    ];

    mockDataApi.jobApplications.getAll.mockResolvedValue({ 
      applications: mockApplications 
    });

    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Microsoft')).toBeInTheDocument();
      expect(screen.getByText('Apple')).toBeInTheDocument();
    });

    // Sort by company
    const sortSelect = screen.getByDisplayValue(/sort by date applied/i);
    fireEvent.change(sortSelect, { target: { value: 'company' } });

    // Check if sorting is applied (Apple should come before Microsoft)
    const applicationCards = screen.getAllByText(/Microsoft|Apple/);
    expect(applicationCards[0]).toHaveTextContent('Apple');
    expect(applicationCards[1]).toHaveTextContent('Microsoft');
  });

  test('switches to analytics tab', async () => {
    const mockApplications = [
      {
        id: 1,
        company: 'Google',
        position: 'Software Engineer',
        status: 'applied',
        dateApplied: '2024-01-15',
      },
      {
        id: 2,
        company: 'Microsoft',
        position: 'Frontend Developer',
        status: 'offer',
        dateApplied: '2024-01-10',
      },
    ];

    mockDataApi.jobApplications.getAll.mockResolvedValue({ 
      applications: mockApplications 
    });

    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Google')).toBeInTheDocument();
    });

    const analyticsTab = screen.getByRole('button', { name: /analytics/i });
    fireEvent.click(analyticsTab);

    expect(screen.getByText('Total Applications')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total count
  });

  test('shows warning for unauthenticated users', async () => {
    render(
      <MockAuthProvider isAuthenticated={false}>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/you're not logged in/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    mockDataApi.jobApplications.getAll.mockRejectedValue(new Error('API Error'));

    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load your job applications/i)).toBeInTheDocument();
    });
  });

  test('shows empty state when no applications exist', async () => {
    mockDataApi.jobApplications.getAll.mockResolvedValue({ applications: [] });

    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No Applications Found')).toBeInTheDocument();
    });

    expect(screen.getByText(/you haven't added any job applications yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add your first application/i })).toBeInTheDocument();
  });

  test('calls onBack when back button is clicked', async () => {
    render(
      <MockAuthProvider>
        <JobTracker onBack={mockOnBack} />
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