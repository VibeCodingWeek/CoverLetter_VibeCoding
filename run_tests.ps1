# PowerShell script to run all tests
Write-Host "🧪 Cover Letter Generator - Test Runner" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

# Function to run frontend tests
function Run-FrontendTests {
    Write-Host "`n🚀 Running Frontend Tests..." -ForegroundColor Green
    Write-Host "-----------------------------" -ForegroundColor Green
    
    # Run React tests with coverage
    npm test -- --coverage --watchAll=false
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend tests passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend tests failed!" -ForegroundColor Red
        return $false
    }
    return $true
}

# Function to run backend tests
function Run-BackendTests {
    Write-Host "`n🐍 Running Backend Tests..." -ForegroundColor Yellow
    Write-Host "---------------------------" -ForegroundColor Yellow
    
    # Navigate to backend directory
    Push-Location backend
    
    try {
        # Run Python tests with coverage
        python -m pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend tests passed!" -ForegroundColor Green
            $result = $true
        } else {
            Write-Host "❌ Backend tests failed!" -ForegroundColor Red
            $result = $false
        }
    }
    finally {
        # Return to original directory
        Pop-Location
    }
    
    return $result
}

# Function to display summary
function Show-Summary {
    param($frontendPassed, $backendPassed)
    
    Write-Host "`n📊 Test Summary" -ForegroundColor Cyan
    Write-Host "===============" -ForegroundColor Cyan
    
    if ($frontendPassed) {
        Write-Host "✅ Frontend: PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend: FAILED" -ForegroundColor Red
    }
    
    if ($backendPassed) {
        Write-Host "✅ Backend:  PASSED" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend:  FAILED" -ForegroundColor Red
    }
    
    if ($frontendPassed -and $backendPassed) {
        Write-Host "`n🎉 All tests passed! Ready for deployment!" -ForegroundColor Green
    } else {
        Write-Host "`n🔧 Some tests failed. Please fix issues before proceeding." -ForegroundColor Red
    }
}

# Main execution
try {
    # Check if we're in the right directory
    if (-not (Test-Path "package.json") -or -not (Test-Path "backend")) {
        Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
        exit 1
    }
    
    # Run tests
    $frontendResult = Run-FrontendTests
    $backendResult = Run-BackendTests
    
    # Show summary
    Show-Summary $frontendResult $backendResult
    
    # Set exit code
    if ($frontendResult -and $backendResult) {
        exit 0
    } else {
        exit 1
    }
}
catch {
    Write-Host "❌ An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} 