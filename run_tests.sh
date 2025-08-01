#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🧪 Cover Letter Generator - Test Runner${NC}"
echo -e "${CYAN}=======================================${NC}"

# Function to run frontend tests
run_frontend_tests() {
    echo -e "\n${GREEN}🚀 Running Frontend Tests...${NC}"
    echo -e "${GREEN}-----------------------------${NC}"
    
    # Run React tests with coverage
    npm test -- --coverage --watchAll=false
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend tests passed!${NC}"
        return 0
    else
        echo -e "${RED}❌ Frontend tests failed!${NC}"
        return 1
    fi
}

# Function to run backend tests
run_backend_tests() {
    echo -e "\n${YELLOW}🐍 Running Backend Tests...${NC}"
    echo -e "${YELLOW}---------------------------${NC}"
    
    # Navigate to backend directory
    cd backend
    
    # Run Python tests with coverage
    python -m pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Backend tests passed!${NC}"
        cd ..
        return 0
    else
        echo -e "${RED}❌ Backend tests failed!${NC}"
        cd ..
        return 1
    fi
}

# Function to display summary
show_summary() {
    local frontend_passed=$1
    local backend_passed=$2
    
    echo -e "\n${CYAN}📊 Test Summary${NC}"
    echo -e "${CYAN}===============${NC}"
    
    if [ $frontend_passed -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend: PASSED${NC}"
    else
        echo -e "${RED}❌ Frontend: FAILED${NC}"
    fi
    
    if [ $backend_passed -eq 0 ]; then
        echo -e "${GREEN}✅ Backend:  PASSED${NC}"
    else
        echo -e "${RED}❌ Backend:  FAILED${NC}"
    fi
    
    if [ $frontend_passed -eq 0 ] && [ $backend_passed -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed! Ready for deployment!${NC}"
    else
        echo -e "\n${RED}🔧 Some tests failed. Please fix issues before proceeding.${NC}"
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Please run this script from the project root directory${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

if [ ! -d "backend/htmlcov" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd backend
    pip install -r requirements.txt
    cd ..
fi

# Run tests
run_frontend_tests
frontend_result=$?

run_backend_tests
backend_result=$?

# Show summary
show_summary $frontend_result $backend_result

# Exit with appropriate code
if [ $frontend_result -eq 0 ] && [ $backend_result -eq 0 ]; then
    exit 0
else
    exit 1
fi 