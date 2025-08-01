# Testing Guide

This guide covers the comprehensive unit testing setup for the Cover Letter Generator application, including both React frontend and Python Flask backend tests.

## 🧪 Test Overview

Our testing setup includes:

- **Frontend Tests**: React component tests using Jest and React Testing Library
- **Backend Tests**: Python API tests using pytest and pytest-flask
- **Coverage Reports**: Test coverage analysis for both frontend and backend
- **CI/CD Ready**: Tests can be integrated into continuous integration pipelines

## 📁 Test Structure

```
CoverLetter_VibeCoding/
├── src/
│   └── __tests__/                     # React tests
│       ├── components/
│       │   ├── AuthModal.test.js
│       │   ├── CoverLetterGenerator.test.js
│       │   ├── JobTracker.test.js
│       │   ├── ResumeBuilder.test.js
│       │   ├── InterviewPrep.test.js
│       │   └── SalaryInsights.test.js
│       └── contexts/
│           └── AuthContext.test.js
├── backend/
│   ├── tests/                         # Python tests
│   │   ├── __init__.py
│   │   ├── conftest.py                # Test configuration and fixtures
│   │   ├── test_auth.py               # Authentication tests
│   │   ├── test_cover_letter.py       # Cover letter API tests
│   │   ├── test_job_applications.py   # Job application API tests
│   │   ├── test_resume.py             # Resume API tests
│   │   ├── test_interview_practice.py # Interview practice API tests
│   │   └── test_salary_searches.py    # Salary search API tests
│   └── pytest.ini                     # Pytest configuration
└── TESTING_README.md                  # This file
```

## 🚀 Frontend Testing (React)

### Prerequisites

The following testing libraries are already installed with Create React App:

- `jest` - Testing framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom jest matchers
- `@testing-library/user-event` - User interaction simulation

### Running Frontend Tests

From the project root directory:

```bash
# Run all tests
npm test

# Run tests in watch mode (default)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test AuthModal.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="authentication"

# Run tests without watch mode (CI/CD)
npm test -- --watchAll=false

# Run tests with verbose output
npm test -- --verbose
```

### Frontend Test Categories

#### Component Tests
- **AuthModal**: Login, signup, forgot password, form validation, API integration
- **CoverLetterGenerator**: Form inputs, PDF generation, data saving, API calls
- **JobTracker**: CRUD operations, filtering, sorting, analytics
- **ResumeBuilder**: Multi-step form, template selection, PDF export
- **InterviewPrep**: Practice sessions, timer functionality, history management
- **SalaryInsights**: Salary search, market data display, search history

#### Context Tests
- **AuthContext**: Authentication state, API utilities, token management, session persistence

### Example Frontend Test Commands

```bash
# Test only authentication related components
npm test -- --testPathPattern="Auth"

# Test with coverage and generate HTML report
npm test -- --coverage --coverageReporters="html" --watchAll=false

# Test specific component with verbose output
npm test CoverLetterGenerator.test.js -- --verbose
```

## 🐍 Backend Testing (Python)

### Prerequisites

Install Python testing dependencies:

```bash
cd backend
pip install pytest pytest-flask pytest-cov
```

### Running Backend Tests

From the `backend` directory:

```bash
# Run all tests
pytest

# Run tests with verbose output
pytest -v

# Run tests with coverage
pytest --cov=app

# Run tests with coverage and HTML report
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run specific test function
pytest tests/test_auth.py::test_login_success

# Run tests matching a pattern
pytest -k "auth"

# Run tests with detailed output
pytest -v --tb=short

# Run tests and stop on first failure
pytest -x

# Run tests in parallel (install pytest-xdist first)
pytest -n auto
```

### Backend Test Categories

#### Authentication Tests (`test_auth.py`)
- User registration (signup)
- User login/logout
- Token verification
- Password reset functionality
- Input validation
- Error handling

#### API Endpoint Tests
- **Cover Letter**: CRUD operations, user isolation, data validation
- **Job Applications**: Application management, filtering, CRUD operations
- **Resume**: Resume building, template handling, complex data structures
- **Interview Practice**: Session management, history tracking, category handling
- **Salary Searches**: Market data handling, search history, user isolation

### Example Backend Test Commands

```bash
# Test only authentication
pytest tests/test_auth.py -v

# Test with coverage excluding test files
pytest --cov=app --cov-report=term-missing

# Test specific API endpoints
pytest tests/test_cover_letter.py tests/test_job_applications.py

# Test with markers (if you add them)
pytest -m "unit"  # Run only unit tests
pytest -m "integration"  # Run only integration tests
```

## 📊 Coverage Reports

### Frontend Coverage

```bash
# Generate coverage report
npm test -- --coverage --watchAll=false

# Coverage files will be in:
# - coverage/lcov-report/index.html (HTML report)
# - coverage/lcov.info (LCOV format)
```

### Backend Coverage

```bash
# Generate coverage report
pytest --cov=app --cov-report=html --cov-report=term

# Coverage files will be in:
# - htmlcov/index.html (HTML report)
# - .coverage (coverage data file)
```

## 🔧 Test Configuration

### Frontend Configuration

Jest configuration is in `package.json`:

```json
{
  "scripts": {
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --watchAll=false"
  },
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx}",
      "!src/index.js",
      "!src/reportWebVitals.js",
      "!src/setupTests.js"
    ]
  }
}
```

### Backend Configuration

Pytest configuration is in `backend/pytest.ini`:

```ini
[tool:pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    --verbose
    --tb=short
    --strict-markers
    --cov=app
    --cov-report=term-missing
    --cov-report=html:htmlcov
    --cov-fail-under=80
```

## 🚦 Continuous Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test -- --coverage --watchAll=false

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          pytest --cov=app --cov-report=xml
```

## 🐛 Debugging Tests

### Frontend Debugging

```bash
# Debug specific test with console logs
npm test -- --no-coverage AuthModal.test.js

# Run tests in debug mode (with Chrome DevTools)
node --inspect-brk=0.0.0.0:9229 node_modules/.bin/react-scripts test --runInBand --no-cache

# Use console.log or screen.debug() in tests
screen.debug(); // Prints current DOM state
```

### Backend Debugging

```bash
# Run tests with print statements
pytest -s tests/test_auth.py

# Debug with pdb
pytest --pdb tests/test_auth.py

# Run specific test with verbose output
pytest -vvv tests/test_auth.py::test_login_success
```

## 📝 Writing New Tests

### Frontend Test Template

```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import YourComponent from '../YourComponent';

describe('YourComponent', () => {
  test('renders correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  test('handles user interaction', async () => {
    render(<YourComponent />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Updated Text')).toBeInTheDocument();
    });
  });
});
```

### Backend Test Template

```python
import pytest

def test_your_endpoint_success(client, auth_headers):
    """Test successful API call."""
    data = {'key': 'value'}
    
    response = client.post('/api/your-endpoint', 
                          headers=auth_headers,
                          json=data)
    
    assert response.status_code == 200
    assert 'expected_key' in response.get_json()

def test_your_endpoint_validation(client, auth_headers):
    """Test validation errors."""
    invalid_data = {'invalid': 'data'}
    
    response = client.post('/api/your-endpoint', 
                          headers=auth_headers,
                          json=invalid_data)
    
    assert response.status_code == 400
    assert 'error message' in response.get_json()['message']
```

## 🔍 Test Best Practices

### Frontend
- Test user behavior, not implementation details
- Use data-testid for elements that are hard to query
- Mock external dependencies (APIs, localStorage)
- Test both happy path and error cases
- Use meaningful test descriptions

### Backend
- Test all API endpoints (GET, POST, PUT, DELETE)
- Test authentication and authorization
- Test input validation and error handling
- Test data persistence and user isolation
- Use fixtures for common test data

## 📈 Coverage Goals

- **Frontend**: Aim for 80%+ coverage on components and contexts
- **Backend**: Aim for 90%+ coverage on API endpoints and business logic
- **Critical Paths**: 100% coverage on authentication and data handling

## 🛠 Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout or check for infinite loops
2. **Mock issues**: Ensure mocks are properly cleared between tests
3. **Database tests failing**: Check if test database is properly isolated
4. **Coverage not accurate**: Exclude test files and build artifacts

### Performance Tips

```bash
# Frontend: Run tests in parallel
npm test -- --maxWorkers=4

# Backend: Use faster test database
export DATABASE_URL="sqlite:///:memory:"

# Skip slow tests during development
pytest -m "not slow"
```

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Flask Testing](https://flask.palletsprojects.com/en/2.0.x/testing/)

---

Happy Testing! 🎉 