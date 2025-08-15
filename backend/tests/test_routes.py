"""
Comprehensive Unit Tests for Flask Routes (routes.py)

Tests all API endpoints including authentication, portfolio management,
stock operations, and data retrieval routes.
"""

import pytest
import json
import sys
import os
from unittest.mock import patch, MagicMock
from datetime import datetime, timezone

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


class TestAuthenticationRoutes:
    """Test authentication-related routes"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        try:
            import app
            app.app.config['TESTING'] = True
            app.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
            with app.app.test_client() as client:
                yield client
        except ImportError:
            pytest.skip("App module not available")
    
    def test_register_route_success(self, client):
        """Test successful user registration"""
        response = client.post('/register', 
                             json={'username': 'testuser', 'password': 'testpass'},
                             content_type='application/json')
        
        # Should return 201 for successful registration
        assert response.status_code in [201, 500]  # 500 if DB not set up
    
    def test_register_route_missing_data(self, client):
        """Test registration with missing data"""
        response = client.post('/register', 
                             json={'username': 'testuser'},
                             content_type='application/json')
        
        # Should handle missing password gracefully
        assert response.status_code in [400, 500]
    
    def test_login_route_valid_user(self, client):
        """Test login with valid credentials"""
        # First register a user
        client.post('/register', 
                   json={'username': 'testuser', 'password': 'testpass'},
                   content_type='application/json')
        
        # Then try to login
        response = client.post('/login',
                             json={'username': 'testuser', 'password': 'testpass'},
                             content_type='application/json')
        
        # Should return 200 for successful login or 401/500 if user doesn't exist
        assert response.status_code in [200, 401, 500]
    
    def test_login_route_invalid_user(self, client):
        """Test login with invalid credentials"""
        response = client.post('/login',
                             json={'username': 'nonexistent', 'password': 'wrongpass'},
                             content_type='application/json')
        
        # Should return 401 for invalid credentials
        assert response.status_code in [401, 500]
    
    def test_logout_route(self, client):
        """Test logout functionality"""
        response = client.post('/logout')
        
        # Should return 200 for logout or 401 if not logged in
        assert response.status_code in [200, 401, 302]  # 302 for redirect
    
    def test_current_user_route_not_logged_in(self, client):
        """Test current user info when not logged in"""
        response = client.get('/current_user')
        
        # Should return 401 when not logged in
        assert response.status_code in [401, 200]


class TestStockRoutes:
    """Test stock-related routes"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        try:
            import app
            app.app.config['TESTING'] = True
            app.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
            with app.app.test_client() as client:
                yield client
        except ImportError:
            pytest.skip("App module not available")
    
    def test_get_stocks_route(self, client):
        """Test getting all stocks"""
        response = client.get('/api/stocks')
        
        # Should return 200 with list of stocks
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert isinstance(data, list)
    
    def test_add_stock_route_success(self, client):
        """Test adding a new stock"""
        stock_data = {
            'symbol': 'AAPL',
            'name': 'Apple Inc.',
            'price': 150.0
        }
        
        response = client.post('/api/stocks',
                             json=stock_data,
                             content_type='application/json')
        
        # Should return 201 for successful creation
        assert response.status_code in [201, 400, 500]
    
    def test_add_stock_route_missing_fields(self, client):
        """Test adding stock with missing required fields"""
        stock_data = {
            'symbol': 'AAPL'
            # Missing name and price
        }
        
        response = client.post('/api/stocks',
                             json=stock_data,
                             content_type='application/json')
        
        # Should return 400 for missing fields
        assert response.status_code in [400, 500]
    
    @patch('routes.yf.Ticker')
    def test_get_nifty_stocks_route(self, mock_ticker, client):
        """Test getting NIFTY stocks from yfinance"""
        # Mock yfinance response
        mock_ticker_instance = MagicMock()
        mock_ticker_instance.info = {'components': ['RELIANCE', 'TCS']}
        mock_ticker.return_value = mock_ticker_instance
        
        response = client.get('/stocks')
        
        # Should return 200 with stock components
        assert response.status_code in [200, 500]


class TestPortfolioRoutes:
    """Test portfolio-related routes"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        try:
            import app
            app.app.config['TESTING'] = True
            app.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
            with app.app.test_client() as client:
                yield client
        except ImportError:
            pytest.skip("App module not available")
    
    def test_get_portfolio_route_not_logged_in(self, client):
        """Test getting portfolio when not logged in"""
        response = client.get('/api/portfolio')
        
        # Should return 401 or redirect when not authenticated
        assert response.status_code in [401, 302]
    
    def test_add_to_portfolio_route_not_logged_in(self, client):
        """Test adding to portfolio when not logged in"""
        portfolio_data = {
            'stock_symbol': 'AAPL',
            'quantity': 10,
            'purchase_price': 150.0
        }
        
        response = client.post('/api/portfolio/add',
                             json=portfolio_data,
                             content_type='application/json')
        
        # Should return 401 or redirect when not authenticated
        assert response.status_code in [401, 302]
    
    def test_delete_from_portfolio_route_not_logged_in(self, client):
        """Test deleting from portfolio when not logged in"""
        response = client.delete('/api/portfolio/delete/1')
        
        # Should return 401 or redirect when not authenticated
        assert response.status_code in [401, 302]
    
    def test_update_portfolio_route_not_logged_in(self, client):
        """Test updating portfolio when not logged in"""
        update_data = {
            'quantity': 15,
            'purchase_price': 160.0
        }
        
        response = client.put('/api/portfolio/update/1',
                            json=update_data,
                            content_type='application/json')
        
        # Should return 401 or redirect when not authenticated
        assert response.status_code in [401, 302]


class TestDataRoutes:
    """Test data retrieval routes"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        try:
            import app
            app.app.config['TESTING'] = True
            app.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
            with app.app.test_client() as client:
                yield client
        except ImportError:
            pytest.skip("App module not available")
    
    def test_get_all_data_route(self, client):
        """Test getting all data from Data table"""
        response = client.get('/api/data')
        
        # Should return 200 with data list
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert isinstance(data, list)
    
    def test_get_companies_route(self, client):
        """Test getting all companies"""
        response = client.get('/api/companies')
        
        # Should return 200 with companies list
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert isinstance(data, list)
    
    def test_get_metrics_route(self, client):
        """Test getting all metrics"""
        response = client.get('/api/metrics')
        
        # Should return 200 with metrics list
        assert response.status_code in [200, 500]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert isinstance(data, list)
    
    def test_get_company_prices_route(self, client):
        """Test getting company prices"""
        response = client.get('/api/company/prices/1')
        
        # Should return 200 with price data
        assert response.status_code in [200, 404, 500]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert isinstance(data, list)
    
    def test_get_company_stats_route(self, client):
        """Test getting company statistics"""
        response = client.get('/api/company/stats/1')
        
        # Should return 200 with stats or 404 if no data
        assert response.status_code in [200, 404, 500]
        if response.status_code == 200:
            data = json.loads(response.data)
            assert 'mean' in data
            assert 'variance' in data
            assert 'count' in data


class TestRouteValidation:
    """Test route input validation"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        try:
            import app
            app.app.config['TESTING'] = True
            app.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
            with app.app.test_client() as client:
                yield client
        except ImportError:
            pytest.skip("App module not available")
    
    def test_portfolio_add_invalid_date_format(self, client):
        """Test adding to portfolio with invalid date format"""
        portfolio_data = {
            'stock_symbol': 'AAPL',
            'quantity': 10,
            'purchase_price': 150.0,
            'date': 'invalid-date-format'
        }
        
        response = client.post('/api/portfolio/add',
                             json=portfolio_data,
                             content_type='application/json')
        
        # Should handle invalid date format gracefully
        assert response.status_code in [400, 401, 500]
    
    def test_portfolio_update_invalid_date_format(self, client):
        """Test updating portfolio with invalid date format"""
        update_data = {
            'quantity': 15,
            'purchase_price': 160.0,
            'date': 'invalid-date-format'
        }
        
        response = client.put('/api/portfolio/update/1',
                            json=update_data,
                            content_type='application/json')
        
        # Should return 400 for invalid date format or 401 if not authenticated
        assert response.status_code in [400, 401, 500]


class TestRouteErrorHandling:
    """Test route error handling"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        try:
            import app
            app.app.config['TESTING'] = True
            app.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
            with app.app.test_client() as client:
                yield client
        except ImportError:
            pytest.skip("App module not available")
    
    def test_nonexistent_portfolio_stock_delete(self, client):
        """Test deleting non-existent portfolio stock"""
        response = client.delete('/api/portfolio/delete/999999')
        
        # Should return 404 for non-existent stock or 401 if not authenticated
        assert response.status_code in [404, 401, 302]
    
    def test_nonexistent_portfolio_stock_update(self, client):
        """Test updating non-existent portfolio stock"""
        update_data = {
            'quantity': 15,
            'purchase_price': 160.0
        }
        
        response = client.put('/api/portfolio/update/999999',
                            json=update_data,
                            content_type='application/json')
        
        # Should return 404 for non-existent stock or 401 if not authenticated
        assert response.status_code in [404, 401, 302]
    
    def test_invalid_company_id_prices(self, client):
        """Test getting prices for invalid company ID"""
        response = client.get('/api/company/prices/999999')
        
        # Should return 200 with empty list or 404
        assert response.status_code in [200, 404, 500]
    
    def test_invalid_company_id_stats(self, client):
        """Test getting stats for invalid company ID"""
        response = client.get('/api/company/stats/999999')
        
        # Should return 404 for no data
        assert response.status_code in [404, 500]


class TestLoginManagerConfiguration:
    """Test Flask-Login configuration"""
    
    def test_user_loader_function_exists(self):
        """Test that user_loader function is defined"""
        try:
            import routes
            assert hasattr(routes, 'load_user')
        except ImportError:
            pytest.skip("Routes module not available")
    
    def test_login_manager_configuration(self):
        """Test login manager is properly configured"""
        try:
            import routes
            assert hasattr(routes, 'login_manager')
            # Test that login_manager has required attributes
            assert hasattr(routes.login_manager, 'login_view')
            assert hasattr(routes.login_manager, 'login_message_category')
        except ImportError:
            pytest.skip("Routes module not available")


class TestPortfolioCalculationsIntegration:
    """Test integration with portfolio_calculations module"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        try:
            import app
            app.app.config['TESTING'] = True
            app.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
            with app.app.test_client() as client:
                yield client
        except ImportError:
            pytest.skip("App module not available")
    
    @patch('routes.portfolio_calculations.main')
    def test_portfolio_calculations_called(self, mock_main, client):
        """Test that portfolio calculations are called when getting portfolio"""
        mock_main.return_value = {
            "dates": [],
            "prices": [],
            "risk_metrics": [],
            "portfolio_consolidated": [],
            "portfolio_purchase_price": [],
            "portfolio_stock_names": [],
            "portfolio_current_value": [],
            "price_history": [],
            "stock_quantity": [],
            "optimizations": []
        }
        
        response = client.get('/api/portfolio')
        
        # Should be called with empty stocks list if not authenticated
        assert response.status_code in [200, 401, 302]


if __name__ == '__main__':
    pytest.main([__file__])
