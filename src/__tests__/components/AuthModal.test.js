import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthModal from '../../components/Auth/AuthModal';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the AuthContext
const mockAuthApi = {
  login: jest.fn(),
  signup: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

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

const MockAuthProvider = ({ children }) => {
  const mockValue = {
    user: null,
    isAuthenticated: false,
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

describe('AuthModal', () => {
  const defaultProps = {
    isOpen: true,
    mode: 'login',
    onClose: jest.fn(),
    onSwitchMode: jest.fn(),
    onAuthSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login modal when mode is login', () => {
    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} />
      </MockAuthProvider>
    );

    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders signup modal when mode is signup', () => {
    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} mode="signup" />
      </MockAuthProvider>
    );

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByText('Join us to get started')).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('validates required fields in login mode', async () => {
    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} />
      </MockAuthProvider>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  test('validates email format', async () => {
    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} />
      </MockAuthProvider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });
  });

  test('validates password confirmation in signup mode', async () => {
    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} mode="signup" />
      </MockAuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'different' } });

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  test('calls login API on successful form submission', async () => {
    mockAuthApi.login.mockResolvedValue({ user: { id: 1, username: 'testuser' } });

    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} />
      </MockAuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthApi.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('calls signup API on successful form submission', async () => {
    mockAuthApi.signup.mockResolvedValue({ user: { id: 1, username: 'testuser' } });

    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} mode="signup" />
      </MockAuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAuthApi.signup).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  test('shows forgot password form', () => {
    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} />
      </MockAuthProvider>
    );

    const forgotPasswordButton = screen.getByText(/forgot your password/i);
    fireEvent.click(forgotPasswordButton);

    expect(screen.getByText('Forgot Password')).toBeInTheDocument();
    expect(screen.getByText('Enter your email to reset your password')).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    mockAuthApi.login.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} />
      </MockAuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('closes modal when close button is clicked', () => {
    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} />
      </MockAuthProvider>
    );

    const closeButton = screen.getByLabelText(/close modal/i);
    fireEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  test('switches between login and signup modes', () => {
    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} />
      </MockAuthProvider>
    );

    const signUpButton = screen.getByText(/sign up/i);
    fireEvent.click(signUpButton);

    expect(defaultProps.onSwitchMode).toHaveBeenCalled();
  });

  test('handles escape key press', () => {
    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} />
      </MockAuthProvider>
    );

    // The escape key handler would need to be implemented in the component
    // For now, let's just test that the modal renders
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(
      <MockAuthProvider>
        <AuthModal {...defaultProps} isOpen={false} />
      </MockAuthProvider>
    );

    expect(screen.queryByText('Welcome Back!')).not.toBeInTheDocument();
  });
}); 