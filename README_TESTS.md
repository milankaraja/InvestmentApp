# InvestmentApp - Comprehensive Unit Test Suite

## 🎯 Overview

This repository contains a complete unit test suite for the **InvestmentApp**, a full-stack investment portfolio management application. The test suite covers both backend (Python/Flask) and frontend (React.js) components with comprehensive coverage of functionality, security, and integration scenarios.

## 🏗️ Application Architecture

### Backend (Python/Flask)
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: SQLite with Alembic migrations
- **Authentication**: Flask-Login with bcrypt password hashing
- **APIs**: RESTful endpoints for portfolio management
- **Financial Calculations**: Advanced portfolio optimization and risk metrics

### Frontend (React.js)
- **Framework**: React.js with React Router
- **State Management**: React Context API
- **HTTP Client**: Axios for API communication
- **Authentication**: Session-based with UserContext

## 📁 Test Structure

```
InvestmentApp/
├── backend/
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py                    # Test fixtures and utilities
│   │   ├── test_app.py                    # Flask application tests
│   │   ├── test_models.py                 # Database model tests
│   │   ├── test_routes.py                 # API endpoint tests
│   │   ├── test_portfolio_calculations.py # Financial calculation tests
│   │   └── test_integration.py            # Integration tests
│   ├── pytest.ini                        # Pytest configuration
│   └── requirements-test.txt              # Testing dependencies
├── frontend/
│   ├── src/
│   │   └── tests/
│   │       └── frontend_tests.js          # React component tests
│   └── package-test.json                  # Jest configuration
├── test_runner.py                         # Comprehensive test runner
└── TEST_DOCUMENTATION.md                  # Detailed test documentation
```

## 🧪 Test Coverage

### Backend Test Coverage

#### 1. **Application Tests** (`test_app.py`)
```python
# Tests Flask application initialization, configuration, and extensions
- Flask app creation and configuration
- Database URI and SQLAlchemy setup
- Security settings (session cookies, secret key)
- CORS configuration for frontend communication
- Extension integration (Flask-Login, Flask-Bcrypt, Flask-Migrate)
```

#### 2. **Model Tests** (`test_models.py`)
```python
# Tests all SQLAlchemy models and relationships
- User model with UserMixin authentication
- Stock, Portfolio, PortfolioStock models
- Company, Metric, Data models for market data
- Foreign key relationships and constraints
- Model methods and properties
```

#### 3. **Route Tests** (`test_routes.py`)
```python
# Tests all API endpoints
- Authentication: /register, /login, /logout, /current_user
- Stock Management: /api/stocks (GET, POST)
- Portfolio Management: /api/portfolio/* (GET, POST, PUT, DELETE)
- Data APIs: /api/companies, /api/metrics, /api/data
- Error handling and validation
```

#### 4. **Portfolio Calculations Tests** (`test_portfolio_calculations.py`)
```python
# Tests financial calculation engine
- Trade and TradeFactory classes
- Portfolio aggregation and calculations
- Risk metrics (Sharpe ratio, VaR, Monte Carlo simulations)
- Portfolio optimization (Modern Portfolio Theory)
- Data provider and historical price queries
```

#### 5. **Integration Tests** (`test_integration.py`)
```python
# Tests component integration
- Database operations with relationships
- Complete authentication flow
- End-to-end API functionality
- Portfolio management with calculations
- Error handling across components
```

### Frontend Test Coverage

#### React Component Tests (`frontend_tests.js`)
```javascript
// Tests React components and user interactions
- App component routing and structure
- Register/Login forms with validation
- UserContext state management
- Dashboard with data fetching
- Portfolio and StockList components
- API integration and error handling
```

## 🚀 Quick Start

### Prerequisites
```bash
# Backend requirements
Python 3.8+
pip

# Frontend requirements (if running frontend tests)
Node.js 14+
npm
```

### 1. Clone and Setup
```bash
cd c:\Users\naikhar\hobby_projects\WealthForge\InvestmentApp
```

### 2. Install Testing Dependencies

#### Backend Dependencies
```bash
cd backend
pip install -r requirements-test.txt
```

#### Frontend Dependencies (Optional)
```bash
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

### 3. Run Tests

#### Option A: Run Complete Test Suite
```bash
# From the root directory
python test_runner.py
```

#### Option B: Run Backend Tests Only
```bash
cd backend
pytest
```

#### Option C: Run Specific Test Files
```bash
# Test models only
pytest tests/test_models.py -v

# Test routes only
pytest tests/test_routes.py -v

# Test with coverage report
pytest --cov=. --cov-report=html
```

## 📊 Test Examples

### Example 1: Testing User Registration
```python
def test_register_route_success(self, client):
    """Test successful user registration"""
    response = client.post('/register', 
                         json={'username': 'testuser', 'password': 'testpass'},
                         content_type='application/json')
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['message'] == 'User registered successfully'
```

### Example 2: Testing Portfolio Risk Calculations
```python
def test_risk_metrics_sharpe_ratio(self):
    """Test Sharpe ratio calculation"""
    price_array = [100, 105, 95, 110, 90, 95, 100]
    risk_metrics = RiskMetrics(price_array, 10000)
    
    sharpe_ratio = risk_metrics.sharpe_ratio()
    assert isinstance(sharpe_ratio, (int, float))
```

### Example 3: Testing Model Relationships
```python
def test_user_portfolio_relationship(self, app_with_db):
    """Test User-Portfolio relationship"""
    user = User(username="testuser", password="hashedpassword")
    portfolio = Portfolio(user_id=user.id)
    
    assert len(user.portfolios) == 1
    assert portfolio.user == user
```

## 🔧 Test Configuration

### Backend Configuration (`pytest.ini`)
```ini
[tool:pytest]
testpaths = tests
addopts = 
    -v
    --tb=short
    --cov=.
    --cov-report=term-missing
    --cov-fail-under=80

markers =
    unit: unit tests
    integration: integration tests
    auth: authentication tests
    api: API endpoint tests
```

### Frontend Configuration (`package-test.json`)
```json
{
  "jest": {
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": ["<rootDir>/src/setupTests.js"],
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 70,
        "lines": 70,
        "statements": 70
      }
    }
  }
}
```

## 🎯 Test Features

### Security Testing
- ✅ Authentication and authorization
- ✅ Session management
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Password hashing with bcrypt

### Functional Testing
- ✅ User registration and login
- ✅ Portfolio CRUD operations
- ✅ Stock data management
- ✅ Financial calculations and optimization
- ✅ API endpoint functionality

### Integration Testing
- ✅ Database operations with relationships
- ✅ Frontend-backend communication
- ✅ Authentication flow
- ✅ Error handling and recovery

### Performance Testing
- ✅ Portfolio calculation efficiency
- ✅ Database query optimization
- ✅ API response validation

## 📈 Coverage Reports

### Generate Coverage Reports
```bash
# Backend HTML coverage report
cd backend
pytest --cov=. --cov-report=html
# Report available at: htmlcov/index.html

# Frontend coverage report
cd frontend
npm run test:coverage
# Report available at: coverage/lcov-report/index.html
```

### Coverage Targets
- **Backend**: 80% minimum line coverage
- **Frontend**: 70% minimum line coverage
- **Critical paths**: 95% coverage

## 🐛 Debugging Tests

### Run Tests in Debug Mode
```bash
# Backend debugging
pytest -v -s tests/test_routes.py::TestAuthenticationRoutes::test_login_route_valid_user

# With pdb debugger
pytest --pdb tests/test_models.py

# Frontend debugging
cd frontend
npm run test:debug
```

### Common Issues and Solutions

#### Issue: Import Errors
```bash
# Solution: Ensure dependencies are installed
pip install -r requirements-test.txt
```

#### Issue: Database Connection Errors
```bash
# Solution: Tests use in-memory SQLite, no external DB needed
# Check that SQLAlchemy is properly configured in test fixtures
```

#### Issue: Mock Objects Not Working
```bash
# Solution: Check conftest.py for proper fixture setup
# Ensure mock patches are applied correctly
```

## 🔍 Test Validation

### Manual Validation Steps
1. **Run complete test suite**: `python test_runner.py`
2. **Check coverage reports**: Open generated HTML reports
3. **Verify all test categories pass**: Unit, Integration, API, Models
4. **Review test output**: Ensure no skipped critical tests

### Expected Output
```
🚀 InvestmentApp Comprehensive Test Suite
==================================================

⚙️ Setting up test environment...
✅ Backend testing dependencies installed successfully

🧪 Running Backend Tests...
========================= test session starts =========================
tests/test_app.py ............................ PASSED
tests/test_models.py ......................... PASSED
tests/test_routes.py ......................... PASSED
tests/test_portfolio_calculations.py ........ PASSED
tests/test_integration.py ................... PASSED

========== 45 passed, 0 failed, 3 skipped in 12.34s ==========
✅ Backend tests completed successfully

📊 Test Report Summary
==================================================
🎉 All tests completed successfully!
```

## 📚 Additional Resources

- **Detailed Test Documentation**: [TEST_DOCUMENTATION.md](TEST_DOCUMENTATION.md)
- **Flask Testing Guide**: [Flask Testing Documentation](https://flask.palletsprojects.com/en/2.3.x/testing/)
- **React Testing Library**: [RTL Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- **pytest Documentation**: [pytest.org](https://docs.pytest.org/)

## 🤝 Contributing

When adding new features to the InvestmentApp:
1. **Write tests first** (TDD approach)
2. **Maintain coverage** above threshold
3. **Update fixtures** in conftest.py if needed
4. **Document test scenarios** in comments

## 📝 Test Maintenance

### Regular Maintenance Tasks
- **Update dependencies**: Keep testing libraries current
- **Review coverage**: Identify untested code paths
- **Refactor tests**: Keep tests maintainable and readable
- **Add edge cases**: Continuously improve test scenarios

This comprehensive test suite ensures the reliability, security, and functionality of the InvestmentApp across all components and user workflows.
