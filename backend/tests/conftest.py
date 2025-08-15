"""
Test fixtures and utilities for backend tests

Provides common fixtures, mock objects, and utility functions
for use across all backend test modules.
"""

import pytest
import sys
import os
from unittest.mock import MagicMock, patch
from datetime import datetime, timezone

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


@pytest.fixture
def mock_app():
    """Mock Flask application for testing"""
    mock_app = MagicMock()
    mock_app.config = {
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SECRET_KEY': 'test-secret-key',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
        'SESSION_COOKIE_HTTPONLY': True,
        'SESSION_COOKIE_SECURE': False
    }
    mock_app.app_context.return_value.__enter__ = MagicMock()
    mock_app.app_context.return_value.__exit__ = MagicMock()
    return mock_app


@pytest.fixture
def mock_db():
    """Mock SQLAlchemy database for testing"""
    mock_db = MagicMock()
    mock_db.create_all = MagicMock()
    mock_db.session.add = MagicMock()
    mock_db.session.commit = MagicMock()
    mock_db.session.rollback = MagicMock()
    mock_db.session.close = MagicMock()
    return mock_db


@pytest.fixture
def mock_bcrypt():
    """Mock bcrypt for password hashing"""
    mock_bcrypt = MagicMock()
    mock_bcrypt.generate_password_hash.return_value = b'hashed_password'
    mock_bcrypt.check_password_hash.return_value = True
    return mock_bcrypt


@pytest.fixture
def sample_user_data():
    """Sample user data for testing"""
    return {
        'id': 1,
        'username': 'testuser',
        'password': 'hashed_password'
    }


@pytest.fixture
def sample_stock_data():
    """Sample stock data for testing"""
    return {
        'id': 1,
        'symbol': 'AAPL',
        'name': 'Apple Inc.',
        'price': 150.0
    }


@pytest.fixture
def sample_portfolio_data():
    """Sample portfolio data for testing"""
    return {
        'id': 1,
        'user_id': 1
    }


@pytest.fixture
def sample_portfolio_stock_data():
    """Sample portfolio stock data for testing"""
    return {
        'id': 1,
        'portfolio_id': 1,
        'company_id': 1,
        'quantity': 10,
        'purchase_price': 150.0,
        'date': datetime.now(timezone.utc)
    }


@pytest.fixture
def sample_company_data():
    """Sample company data for testing"""
    return {
        'Company_ID': 1,
        'company': 'Apple Inc.'
    }


@pytest.fixture
def sample_metric_data():
    """Sample metric data for testing"""
    return {
        'Metric_ID': 1,
        'metric': 'Close'
    }


@pytest.fixture
def sample_data_point():
    """Sample data point for testing"""
    return {
        'Data_ID': 1,
        'Company_ID': 1,
        'Metric_ID': 1,
        'Date': datetime.now(timezone.utc),
        'value': 150.0
    }


@pytest.fixture
def sample_trade_data():
    """Sample trade data for portfolio calculations"""
    return [
        {
            'id': 1,
            'symbol': 'AAPL',
            'purchase_price': 150.0,
            'quantity': 10,
            'date': datetime.now(timezone.utc)
        },
        {
            'id': 2,
            'symbol': 'GOOGL',
            'purchase_price': 2500.0,
            'quantity': 5,
            'date': datetime.now(timezone.utc)
        }
    ]


@pytest.fixture
def sample_price_array():
    """Sample price array for risk calculations"""
    return [100, 105, 95, 110, 90, 95, 100, 102, 98, 106]


@pytest.fixture
def mock_portfolio_value_provider():
    """Mock PortfolioValueProvider for testing"""
    with patch('portfolio_calculations.PortfolioValueProvider') as mock:
        mock_instance = MagicMock()
        mock_instance.get_asset_value.return_value = 160.0
        mock_instance.get_asset_values.return_value = {
            '2023-01-01': 150.0,
            '2023-01-02': 155.0,
            '2023-01-03': 160.0
        }
        mock.return_value = mock_instance
        yield mock_instance


@pytest.fixture
def mock_yfinance():
    """Mock yfinance for testing stock data retrieval"""
    with patch('routes.yf.Ticker') as mock_ticker:
        mock_ticker_instance = MagicMock()
        mock_ticker_instance.info = {
            'components': ['RELIANCE', 'TCS', 'INFY', 'HDFC']
        }
        mock_ticker.return_value = mock_ticker_instance
        yield mock_ticker_instance


@pytest.fixture
def client_fixture():
    """Flask test client fixture with improved isolation"""
    try:
        import app
        app.app.config['TESTING'] = True
        app.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        app.app.config['WTF_CSRF_ENABLED'] = False
        app.app.config['SECRET_KEY'] = 'test-secret-key-' + str(hash(datetime.now()))
        
        with app.app.test_client() as client:
            with app.app.app_context():
                try:
                    # Drop all tables first to ensure clean state
                    app.db.drop_all()
                    app.db.create_all()
                    yield client
                finally:
                    # Clean up after test
                    app.db.session.remove()
                    app.db.drop_all()
    except ImportError:
        pytest.skip("App module not available")


class MockUser:
    """Mock User object for testing"""
    def __init__(self, id=1, username="testuser", password="hashed_password"):
        self.id = id
        self.username = username
        self.password = password
        self.is_authenticated = True
        self.is_active = True
        self.is_anonymous = False
    
    def get_id(self):
        return str(self.id)


class MockStock:
    """Mock Stock object for testing"""
    def __init__(self, id=1, symbol="AAPL", name="Apple Inc.", price=150.0):
        self.id = id
        self.symbol = symbol
        self.name = name
        self.price = price


class MockCompany:
    """Mock Company object for testing"""
    def __init__(self, Company_ID=1, company="Apple Inc."):
        self.Company_ID = Company_ID
        self.company = company
    
    def to_dict(self):
        return {
            'Company_ID': self.Company_ID,
            'company': self.company
        }


class MockMetric:
    """Mock Metric object for testing"""
    def __init__(self, Metric_ID=1, metric="Close"):
        self.Metric_ID = Metric_ID
        self.metric = metric
    
    def to_dict(self):
        return {
            'Metric_ID': self.Metric_ID,
            'metric': self.metric
        }


class MockData:
    """Mock Data object for testing"""
    def __init__(self, Data_ID=1, Company_ID=1, Metric_ID=1, Date=None, value=150.0):
        self.Data_ID = Data_ID
        self.Company_ID = Company_ID
        self.Metric_ID = Metric_ID
        self.Date = Date or datetime.now(timezone.utc)
        self.value = value
    
    def to_dict(self):
        return {
            'Data_ID': self.Data_ID,
            'Company_ID': self.Company_ID,
            'Metric_ID': self.Metric_ID,
            'Date': self.Date.isoformat(),
            'value': self.value
        }


def create_mock_portfolio_response():
    """Create mock portfolio calculation response"""
    return {
        "dates": ["2023-01-01", "2023-01-02", "2023-01-03"],
        "prices": [1000, 1050, 1100],
        "risk_metrics": {
            "mean": 1050,
            "variance": 2500,
            "std_dev": 50,
            "sharpe_ratio": 1.2,
            "value_at_risk": -0.05
        },
        "portfolio_consolidated": [],
        "portfolio_purchase_price": [150.0, 2500.0],
        "portfolio_stock_names": ["AAPL", "GOOGL"],
        "portfolio_current_value": [1600.0, 13000.0],
        "price_history": {},
        "stock_quantity": [10, 5],
        "optimizations": {}
    }


# Test utility functions
def assert_response_status(response, expected_status):
    """Assert response status with helpful error message"""
    assert response.status_code == expected_status, \
        f"Expected status {expected_status}, got {response.status_code}. Response data: {response.data}"


def assert_json_contains_keys(response_data, required_keys):
    """Assert that JSON response contains required keys"""
    for key in required_keys:
        assert key in response_data, f"Required key '{key}' not found in response"


def create_test_user(db_session, username=None, password="testpass"):
    """Create a test user in the database with unique username"""
    try:
        from models import User
        import app
        import uuid
        
        # Generate unique username if not provided
        if username is None:
            username = f"testuser_{uuid.uuid4().hex[:8]}"
        
        hashed_password = app.bcrypt.generate_password_hash(password).decode('utf-8')
        user = User(username=username, password=hashed_password)
        db_session.add(user)
        db_session.commit()
        return user
    except ImportError:
        return MockUser(username=username or "testuser", password=password)


def create_test_company(db_session, company_name=None):
    """Create a test company in the database with unique name"""
    try:
        from models import Company
        import uuid
        
        # Generate unique company name if not provided
        if company_name is None:
            company_name = f"Test Company {uuid.uuid4().hex[:8]}"
        
        company = Company(company=company_name)
        db_session.add(company)
        db_session.commit()
        return company
    except ImportError:
        return MockCompany(company=company_name or "Test Company")


@pytest.fixture
def clean_database():
    """Ensure clean database state for each test"""
    try:
        import app
        with app.app.app_context():
            # Clean up any existing data
            app.db.session.rollback()
            app.db.drop_all()
            app.db.create_all()
            yield app.db
            # Clean up after test
            app.db.session.rollback()
            app.db.session.close()
    except ImportError:
        yield mock_db()


@pytest.fixture(autouse=True)
def isolate_tests():
    """Auto-use fixture to ensure test isolation"""
    # This runs before each test
    yield
    # This runs after each test - cleanup any global state
    try:
        import app
        # Only attempt cleanup if we're in an application context
        if app.app.app_context:
            try:
                with app.app.app_context():
                    if hasattr(app, 'db') and app.db.session:
                        app.db.session.rollback()
                        app.db.session.close()
            except RuntimeError:
                # Already outside app context, no cleanup needed
                pass
    except (ImportError, AttributeError):
        pass


@pytest.fixture
def unique_user_data():
    """Generate unique user data for each test"""
    import uuid
    return {
        'id': 1,
        'username': f'testuser_{uuid.uuid4().hex[:8]}',
        'password': 'hashed_password'
    }
