# Comprehensive Test Documentation for InvestmentApp

## Overview
This document provides a complete guide to the unit test coverage for the InvestmentApp, a full-stack investment portfolio management application.

## Test Structure

### Backend Tests (Python/Flask)
Located in: `backend/tests/`

#### 1. Application Tests (`test_app.py`)
- **Flask App Initialization**: Tests Flask application setup, configuration, and extensions
- **Database Configuration**: Tests SQLAlchemy database URI and settings
- **Security Configuration**: Tests session cookie settings and secret key configuration
- **CORS Configuration**: Tests cross-origin resource sharing setup
- **Extension Integration**: Tests Flask-Login, Flask-Bcrypt, Flask-Migrate integration

#### 2. Model Tests (`test_models.py`)
- **User Model**: Tests UserMixin integration, authentication properties, relationships
- **Stock Model**: Tests stock data storage and retrieval
- **Portfolio Model**: Tests portfolio creation and user relationships
- **PortfolioStock Model**: Tests many-to-many relationship between portfolios and companies
- **Company Model**: Tests company data storage and relationships
- **Metric Model**: Tests metric definitions for stock data
- **Data Model**: Tests time-series stock data storage
- **Relationship Testing**: Tests all foreign key relationships and backref configurations

#### 3. Route Tests (`test_routes.py`)
- **Authentication Routes**: 
  - Registration with validation
  - Login/logout functionality
  - Session management
  - Current user information retrieval
- **Stock Management Routes**:
  - Stock creation and retrieval
  - NIFTY stock data from yfinance
  - Stock price and statistics APIs
- **Portfolio Management Routes**:
  - Adding stocks to portfolio
  - Updating portfolio holdings
  - Deleting portfolio items
  - Portfolio data retrieval with calculations
- **Data API Routes**:
  - Company data retrieval
  - Metric data retrieval
  - Historical price data
  - Statistical calculations

#### 4. Portfolio Calculations Tests (`test_portfolio_calculations.py`)
- **Trade Class**: Tests trade object creation and value calculations
- **TradeFactory**: Tests factory pattern for trade creation
- **Portfolio Class**: Tests portfolio aggregation, net calculations, risk metrics
- **PortfolioValueProvider**: Tests database queries for stock prices and historical data
- **RiskMetrics Class**: 
  - Statistical calculations (mean, variance, standard deviation)
  - Financial ratios (Sharpe ratio, Sortino ratio)
  - Risk measures (Value at Risk, Monte Carlo VaR)
  - Rolling calculations and volatility measures
- **PortfolioOptimizer Class**:
  - Modern Portfolio Theory optimization
  - Multiple optimization strategies (Sharpe, min variance, max return, etc.)
  - Constraint handling and efficient frontier generation
  - Visualization generation for optimization results
- **OutputForPHP Class**: Tests portfolio data formatting and optimization integration

#### 5. Integration Tests (`test_integration.py`)
- **Database Integration**: Tests complete database operations with relationships
- **Authentication Flow**: Tests complete user registration and login flow
- **API Endpoint Integration**: Tests end-to-end API functionality
- **Portfolio Integration**: Tests portfolio management with calculations
- **Error Handling**: Tests graceful error handling across components
- **Session Management**: Tests session persistence and security

### Frontend Tests (React/JavaScript)
Located in: `frontend/src/tests/`

#### 1. Component Tests (`frontend_tests.js`)
- **App Component**: Tests main application structure and routing
- **Register Component**: 
  - Form rendering and validation
  - Input handling and state management
  - API integration with error handling
  - Navigation after successful registration
- **Login Component**:
  - Authentication form functionality
  - UserContext integration
  - Session management
  - Error handling and user feedback
- **UserContext**: Tests React Context for user state management
- **Dashboard Component**:
  - Data fetching on component mount
  - Integration with Portfolio and StockList components
  - State management for user stocks and market data
- **Portfolio Component**: Tests portfolio display and management
- **StockList Component**: Tests market data display

#### 2. Integration Tests
- **API Integration**: Tests axios calls and error handling
- **Navigation**: Tests React Router integration
- **State Management**: Tests user context across components
- **Form Validation**: Tests input validation and error messages

## Test Configuration

### Backend Configuration
- **pytest.ini**: Configuration for test discovery, coverage, and reporting
- **conftest.py**: Shared fixtures and utilities
- **requirements-test.txt**: Testing dependencies

### Frontend Configuration
- **package-test.json**: Jest configuration and testing dependencies
- **setupTests.js**: Test environment setup for React Testing Library

## Running Tests

### Backend Tests
```bash
# Install dependencies
pip install -r backend/requirements-test.txt

# Run all tests with coverage
cd backend
pytest

# Run specific test file
pytest tests/test_models.py

# Run with detailed coverage report
pytest --cov=. --cov-report=html
```

### Frontend Tests
```bash
# Install dependencies
cd frontend
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in CI mode
npm run test:ci
```

### Complete Test Suite
```bash
# Run comprehensive test suite
python test_runner.py
```

## Test Coverage Areas

### Security Testing
- Authentication and authorization
- Session management and security
- Input validation and sanitization
- CORS configuration
- SQL injection prevention

### Functional Testing
- User registration and login
- Portfolio management operations
- Stock data retrieval and display
- Risk calculations and optimization
- API endpoint functionality

### Integration Testing
- Database operations with relationships
- Frontend-backend communication
- Authentication flow across components
- Error handling and recovery

### Performance Testing
- Portfolio calculation efficiency
- Database query optimization
- API response times
- Frontend rendering performance

## Mock Objects and Fixtures

### Backend Mocks
- Mock Flask application and database
- Mock external APIs (yfinance)
- Mock authentication components
- Sample data fixtures for all models

### Frontend Mocks
- Mock API calls with axios
- Mock React Router navigation
- Mock UserContext state
- Mock component props and state

## Quality Metrics

### Coverage Targets
- Backend: 80% line coverage minimum
- Frontend: 70% line coverage minimum
- Critical paths: 95% coverage

### Test Quality Indicators
- All API endpoints tested
- All database models tested
- All user workflows tested
- Error conditions handled
- Edge cases covered

## Continuous Integration

The test suite is designed to be run in CI/CD pipelines with:
- Automated dependency installation
- Parallel test execution
- Coverage reporting
- Test result artifacts
- Quality gate enforcement

## Dependencies

### Backend Testing Stack
- pytest: Test framework
- pytest-cov: Coverage reporting
- pytest-mock: Mocking utilities
- pytest-flask: Flask testing integration

### Frontend Testing Stack
- Jest: Test framework and runner
- React Testing Library: Component testing utilities
- Jest DOM: Additional DOM matchers
- User Event: User interaction simulation

This comprehensive test suite ensures the reliability, security, and functionality of the InvestmentApp across all components and user workflows.
