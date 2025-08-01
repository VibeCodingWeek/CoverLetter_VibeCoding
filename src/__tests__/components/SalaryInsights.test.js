import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SalaryInsights from '../../components/SalaryInsights/SalaryInsights';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the AuthContext
const mockDataApi = {
  salarySearches: {
    getAll: jest.fn(),
    save: jest.fn(),
  },
};

const MockAuthProvider = ({ children, isAuthenticated = true }) => {
  return (
    <AuthProvider value={{ 
      dataApi: mockDataApi,
      isAuthenticated,
    }}>
      {children}
    </AuthProvider>
  );
};

describe('SalaryInsights', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataApi.salarySearches.getAll.mockResolvedValue({ searches: [] });
  });

  test('renders salary insights dashboard', async () => {
    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('💰 Salary Insights')).toBeInTheDocument();
    });

    expect(screen.getByText('Research competitive salaries and negotiate with confidence')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /📊 saved searches/i })).toBeInTheDocument();
  });

  test('displays salary search form', async () => {
    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/search salary information/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/years of experience/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search salaries/i })).toBeInTheDocument();
  });

  test('validates required fields before searching', async () => {
    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /search salaries/i })).toBeInTheDocument();
    });

    const searchButton = screen.getByRole('button', { name: /search salaries/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter both job title and location/i)).toBeInTheDocument();
    });
  });

  test('performs salary search successfully', async () => {
    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    });

    // Fill in search form
    fireEvent.change(screen.getByLabelText(/job title/i), { 
      target: { value: 'Software Engineer' } 
    });
    fireEvent.change(screen.getByLabelText(/location/i), { 
      target: { value: 'San Francisco, CA' } 
    });

    const searchButton = screen.getByRole('button', { name: /search salaries/i });
    fireEvent.click(searchButton);

    // Wait for search to complete (mocked with setTimeout)
    await waitFor(() => {
      expect(screen.getByText(/salary results/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    expect(screen.getByText(/average salary/i)).toBeInTheDocument();
    expect(screen.getByText(/market insights/i)).toBeInTheDocument();
  });

  test('saves search results for authenticated users', async () => {
    mockDataApi.salarySearches.save.mockResolvedValue({});

    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    });

    // Perform search first
    fireEvent.change(screen.getByLabelText(/job title/i), { 
      target: { value: 'Software Engineer' } 
    });
    fireEvent.change(screen.getByLabelText(/location/i), { 
      target: { value: 'San Francisco, CA' } 
    });

    const searchButton = screen.getByRole('button', { name: /search salaries/i });
    fireEvent.click(searchButton);

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/salary results/i)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Save search
    const saveButton = screen.getByRole('button', { name: /💾 save search/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockDataApi.salarySearches.save).toHaveBeenCalled();
    });

    expect(screen.getByText(/✅ search saved successfully/i)).toBeInTheDocument();
  });

  test('loads saved searches on mount', async () => {
    const mockSearches = [
      {
        jobTitle: 'Software Engineer',
        location: 'San Francisco, CA',
        experience: '3-5',
        salaryRange: { min: 120000, max: 180000, average: 150000 },
        marketData: { percentile50: 150000, percentile75: 170000, totalCompensation: 180000 },
        savedDate: '2024-01-15T10:00:00Z'
      }
    ];

    mockDataApi.salarySearches.getAll.mockResolvedValue({ searches: mockSearches });

    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(mockDataApi.salarySearches.getAll).toHaveBeenCalled();
    });
  });

  test('displays saved searches', async () => {
    const mockSearches = [
      {
        jobTitle: 'Software Engineer',
        location: 'San Francisco, CA',
        experience: '3-5',
        salaryRange: { min: 120000, max: 180000, average: 150000 },
        marketData: { percentile50: 150000, percentile75: 170000, totalCompensation: 180000 },
        savedDate: '2024-01-15T10:00:00Z'
      }
    ];

    mockDataApi.salarySearches.getAll.mockResolvedValue({ searches: mockSearches });

    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('💰 Salary Insights')).toBeInTheDocument();
    });

    // Navigate to saved searches
    const savedSearchesTab = screen.getByRole('button', { name: /saved searches/i });
    fireEvent.click(savedSearchesTab);

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
  });

  test('clears search history', async () => {
    const mockSearches = [
      {
        jobTitle: 'Software Engineer',
        location: 'San Francisco, CA',
        experience: '3-5',
        salaryRange: { min: 120000, max: 180000, average: 150000 },
        savedDate: '2024-01-15T10:00:00Z'
      }
    ];

    mockDataApi.salarySearches.getAll.mockResolvedValue({ searches: mockSearches });

    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('💰 Salary Insights')).toBeInTheDocument();
    });

    // Navigate to saved searches tab (not the header button)
    const savedSearchesTab = screen.getByRole('button', { name: /💾 saved searches/i });
    fireEvent.click(savedSearchesTab);

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    const clearButton = screen.getByRole('button', { name: /🗑️ clear history/i });
    fireEvent.click(clearButton);

    expect(screen.getByText(/✅ search history cleared successfully/i)).toBeInTheDocument();
  });

  test('shows empty state when no searches exist', async () => {
    mockDataApi.salarySearches.getAll.mockResolvedValue({ searches: [] });

    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('💰 Salary Insights')).toBeInTheDocument();
    });

    // Navigate to saved searches tab (not the header button)
    const savedSearchesTab = screen.getByRole('button', { name: /💾 saved searches/i });
    fireEvent.click(savedSearchesTab);

    expect(screen.getByText(/no saved searches/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /🔍 start searching/i })).toBeInTheDocument();
  });

  test('displays salary research tips', async () => {
    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('💡 Salary Research Tips')).toBeInTheDocument();
    });

    expect(screen.getByText('📊 Multiple Sources')).toBeInTheDocument();
    expect(screen.getByText('🌍 Location Matters')).toBeInTheDocument();
    expect(screen.getByText('📈 Total Compensation')).toBeInTheDocument();
    expect(screen.getByText('🎯 Negotiate Smartly')).toBeInTheDocument();
  });

  test('shows warning for unauthenticated users', async () => {
    render(
      <MockAuthProvider isAuthenticated={false}>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/you're not logged in/i)).toBeInTheDocument();
    });
  });

  test('handles API errors gracefully', async () => {
    mockDataApi.salarySearches.getAll.mockRejectedValue(new Error('API Error'));

    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/salary insights/i)).toBeInTheDocument();
    });
  });

  test('formats salary amounts correctly', async () => {
    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
      </MockAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/job title/i)).toBeInTheDocument();
    });

    // Perform search
    fireEvent.change(screen.getByLabelText(/job title/i), { 
      target: { value: 'Software Engineer' } 
    });
    fireEvent.change(screen.getByLabelText(/location/i), { 
      target: { value: 'San Francisco, CA' } 
    });

    const searchButton = screen.getByRole('button', { name: /search salaries/i });
    fireEvent.click(searchButton);

    // Wait for results and check currency formatting
    await waitFor(() => {
      const salaryElements = screen.getAllByText(/\$[\d,]+/);
      expect(salaryElements.length).toBeGreaterThan(0); // Should show multiple currency formatted numbers
    }, { timeout: 2000 });
  });

  test('calls onBack when back button is clicked', async () => {
    render(
      <MockAuthProvider>
        <SalaryInsights onBack={mockOnBack} />
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