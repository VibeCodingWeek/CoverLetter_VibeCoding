import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InterviewPrep from '../../components/InterviewPrep/InterviewPrep';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the AuthContext
const mockDataApi = {
  interviewPractice: {
    getHistory: jest.fn(),
    saveSession: jest.fn(),
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
  resume: {
    get: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
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

describe('InterviewPrep', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataApi.interviewPractice.getHistory.mockResolvedValue({ history: [] });
  });

  test('renders interview prep dashboard', async () => {
    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('🎤 Interview Preparation')).toBeInTheDocument();
    });

    expect(screen.getByText('Practice common interview questions and build confidence')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view history/i })).toBeInTheDocument();
  });

  test('displays question categories', async () => {
    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Behavioral Questions')).toBeInTheDocument();
    });

    expect(screen.getByText('Technical Questions')).toBeInTheDocument();
    expect(screen.getByText('Situational Questions')).toBeInTheDocument();
    expect(screen.getByText('Company-Specific Questions')).toBeInTheDocument();
  });

  test('loads practice history on mount', async () => {
    const mockHistory = [
      {
        category: 'behavioral',
        question: 'Tell me about a time when...',
        userAnswer: 'In my previous role...',
        timeTaken: 120,
        sessionDate: '2024-01-15T10:00:00Z'
      }
    ];

    mockDataApi.interviewPractice.getHistory.mockResolvedValue({ history: mockHistory });

    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(mockDataApi.interviewPractice.getHistory).toHaveBeenCalled();
    });
  });

  test('starts practice session for a category', async () => {
    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Behavioral Questions')).toBeInTheDocument();
    });

    // Click on behavioral questions category
    const behavioralCard = screen.getByText('Behavioral Questions').closest('.category-card');
    fireEvent.click(behavioralCard);

    expect(screen.getByText('Behavioral Questions')).toBeInTheDocument();
    expect(screen.getByText(/question 1 of/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type your answer/i)).toBeInTheDocument();
  });

  test('timer functionality works correctly', async () => {
    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Behavioral Questions')).toBeInTheDocument();
    });

    // Start practice session
    const behavioralCard = screen.getByText('Behavioral Questions').closest('.category-card');
    fireEvent.click(behavioralCard);

    // Check timer controls
    expect(screen.getByRole('button', { name: /▶️ start/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🔄 reset/i })).toBeInTheDocument();

    // Start timer
    const startButton = screen.getByRole('button', { name: /▶️ start/i });
    fireEvent.click(startButton);

    expect(screen.getByRole('button', { name: /⏸️ pause/i })).toBeInTheDocument();
  });

  test('navigates between questions', async () => {
    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Behavioral Questions')).toBeInTheDocument();
    });

    // Start practice session
    const behavioralCard = screen.getByText('Behavioral Questions').closest('.category-card');
    fireEvent.click(behavioralCard);

    // Navigate to next question
    const nextButton = screen.getByRole('button', { name: /next question/i });
    fireEvent.click(nextButton);

    expect(screen.getByText(/question 2 of/i)).toBeInTheDocument();

    // Navigate back to previous question
    const prevButton = screen.getByRole('button', { name: /previous question/i });
    fireEvent.click(prevButton);

    expect(screen.getByText(/question 1 of/i)).toBeInTheDocument();
  });

  test('saves practice session for authenticated users', async () => {
    mockDataApi.interviewPractice.saveSession.mockResolvedValue({});

    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Behavioral Questions')).toBeInTheDocument();
    });

    // Start practice session
    const behavioralCard = screen.getByText('Behavioral Questions').closest('.category-card');
    fireEvent.click(behavioralCard);

    // Type answer
    const answerTextarea = screen.getByPlaceholderText(/type your answer/i);
    fireEvent.change(answerTextarea, { 
      target: { value: 'This is my practice answer...' } 
    });

    // Save answer
    const saveButton = screen.getByRole('button', { name: /💾 save answer/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockDataApi.interviewPractice.saveSession).toHaveBeenCalled();
    });

    expect(screen.getByText(/practice session saved successfully/i)).toBeInTheDocument();
  });

  test('validates answer before saving', async () => {
    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Behavioral Questions')).toBeInTheDocument();
    });

    // Start practice session
    const behavioralCard = screen.getByText('Behavioral Questions').closest('.category-card');
    fireEvent.click(behavioralCard);

    // Try to save without typing answer
    const saveButton = screen.getByRole('button', { name: /💾 save answer/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter an answer before saving/i)).toBeInTheDocument();
    });
  });

  test('displays practice history', async () => {
    const mockHistory = [
      {
        category: 'behavioral',
        question: 'Tell me about a time when you faced a challenge.',
        userAnswer: 'In my previous role, I encountered...',
        timeTaken: 180,
        sessionDate: '2024-01-15T10:00:00Z'
      },
      {
        category: 'technical',
        question: 'Explain your experience with React.',
        userAnswer: 'I have been working with React for...',
        timeTaken: 150,
        sessionDate: '2024-01-14T14:30:00Z'
      }
    ];

    mockDataApi.interviewPractice.getHistory.mockResolvedValue({ history: mockHistory });

    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Interview Preparation')).toBeInTheDocument();
    });

    // Navigate to history tab
    const historyTab = screen.getByRole('button', { name: /practice history/i });
    fireEvent.click(historyTab);

    expect(screen.getByText('Practice History')).toBeInTheDocument();
    expect(screen.getByText('Total Sessions')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Total count
  });

  test('clears practice history', async () => {
    const mockHistory = [
      {
        category: 'behavioral',
        question: 'Tell me about yourself.',
        userAnswer: 'I am a software developer...',
        timeTaken: 120,
        sessionDate: '2024-01-15T10:00:00Z'
      }
    ];

    mockDataApi.interviewPractice.getHistory.mockResolvedValue({ history: mockHistory });

    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('🎤 Interview Preparation')).toBeInTheDocument();
    });

    // Navigate to history tab
    const historyTab = screen.getByRole('button', { name: /practice history/i });
    fireEvent.click(historyTab);

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    const clearButton = screen.getByRole('button', { name: /🗑️ clear history/i });
    fireEvent.click(clearButton);

    expect(screen.getByText(/practice history cleared successfully/i)).toBeInTheDocument();
  });

  test('shows warning for unauthenticated users', async () => {
    render(
      <MockAuthProvider isAuthenticated={false}>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/you're not logged in/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    mockDataApi.interviewPractice.getHistory.mockRejectedValue(new Error('API Error'));

    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to load your practice history/i)).toBeInTheDocument();
    });
  });

  test('shows empty state when no history exists', async () => {
    mockDataApi.interviewPractice.getHistory.mockResolvedValue({ history: [] });

    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('🎤 Interview Preparation')).toBeInTheDocument();
    });

    // Navigate to history tab
    const historyTab = screen.getByRole('button', { name: /practice history/i });
    fireEvent.click(historyTab);

    expect(screen.getByText('No Practice History')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start practicing/i })).toBeInTheDocument();
  });

  test('displays interview tips', async () => {
    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('💡 Interview Tips')).toBeInTheDocument();
    });

    expect(screen.getByText('📚 Research')).toBeInTheDocument();
    expect(screen.getByText('⭐ STAR Method')).toBeInTheDocument();
    expect(screen.getByText('❓ Ask Questions')).toBeInTheDocument();
    expect(screen.getByText('🎯 Practice')).toBeInTheDocument();
  });

  test('calls onBack when back button is clicked', async () => {
    render(
      <MockAuthProvider>
        <InterviewPrep onBack={mockOnBack} />
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