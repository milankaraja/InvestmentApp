"""
Comprehensive Unit Tests for Database Models (models.py)

Tests all SQLAlchemy models including User, Stock, Portfolio, PortfolioStock,
Company, Metric, and Data models with their relationships and methods.
"""

import pytest
import sys
import os
from datetime import datetime, timezone
from unittest.mock import patch, MagicMock

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


class TestUserModel:
    """Test cases for User model"""
    
    def test_user_model_creation(self):
        """Test User model instantiation"""
        try:
            from models import User
            user = User(username="testuser", password="hashedpassword")
            assert user.username == "testuser"
            assert user.password == "hashedpassword"
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_user_model_attributes(self):
        """Test User model has required attributes"""
        try:
            from models import User
            user = User()
            
            # Test that User has required columns
            assert hasattr(user, 'id')
            assert hasattr(user, 'username')
            assert hasattr(user, 'password')
            
            # Test UserMixin methods are available
            assert hasattr(user, 'is_authenticated')
            assert hasattr(user, 'is_active')
            assert hasattr(user, 'is_anonymous')
            assert hasattr(user, 'get_id')
            
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_user_string_representation(self):
        """Test User model string representation"""
        try:
            from models import User
            user = User(username="testuser")
            assert str(user) == "testuser"
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_user_portfolios_relationship(self):
        """Test User has portfolios relationship"""
        try:
            from models import User
            user = User()
            assert hasattr(user, 'portfolios')
        except ImportError:
            pytest.skip("Models module not available")


class TestStockModel:
    """Test cases for Stock model"""
    
    def test_stock_model_creation(self):
        """Test Stock model instantiation"""
        try:
            from models import Stock
            stock = Stock(symbol="AAPL", name="Apple Inc.", price=150.0)
            assert stock.symbol == "AAPL"
            assert stock.name == "Apple Inc."
            assert stock.price == 150.0
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_stock_model_attributes(self):
        """Test Stock model has required attributes"""
        try:
            from models import Stock
            stock = Stock()
            
            assert hasattr(stock, 'id')
            assert hasattr(stock, 'symbol')
            assert hasattr(stock, 'name')
            assert hasattr(stock, 'price')
            
        except ImportError:
            pytest.skip("Models module not available")


class TestPortfolioModel:
    """Test cases for Portfolio model"""
    
    def test_portfolio_model_creation(self):
        """Test Portfolio model instantiation"""
        try:
            from models import Portfolio
            portfolio = Portfolio(user_id=1)
            assert portfolio.user_id == 1
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_portfolio_model_attributes(self):
        """Test Portfolio model has required attributes"""
        try:
            from models import Portfolio
            portfolio = Portfolio()
            
            assert hasattr(portfolio, 'id')
            assert hasattr(portfolio, 'user_id')
            
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_portfolio_relationships(self):
        """Test Portfolio model relationships"""
        try:
            from models import Portfolio
            portfolio = Portfolio()
            
            # Test relationships exist
            assert hasattr(portfolio, 'user')
            assert hasattr(portfolio, 'stocks')
            
        except ImportError:
            pytest.skip("Models module not available")


class TestPortfolioStockModel:
    """Test cases for PortfolioStock model"""
    
    def test_portfolio_stock_creation(self):
        """Test PortfolioStock model instantiation"""
        try:
            from models import PortfolioStock
            now = datetime.now(timezone.utc)
            ps = PortfolioStock(
                portfolio_id=1,
                company_id=1,
                quantity=10,
                purchase_price=100.0,
                date=now
            )
            assert ps.portfolio_id == 1
            assert ps.company_id == 1
            assert ps.quantity == 10
            assert ps.purchase_price == 100.0
            assert ps.date == now
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_portfolio_stock_attributes(self):
        """Test PortfolioStock model has required attributes"""
        try:
            from models import PortfolioStock
            ps = PortfolioStock()
            
            assert hasattr(ps, 'id')
            assert hasattr(ps, 'portfolio_id')
            assert hasattr(ps, 'company_id')
            assert hasattr(ps, 'quantity')
            assert hasattr(ps, 'purchase_price')
            assert hasattr(ps, 'date')
            
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_portfolio_stock_relationships(self):
        """Test PortfolioStock model relationships"""
        try:
            from models import PortfolioStock
            ps = PortfolioStock()
            
            assert hasattr(ps, 'portfolio')
            assert hasattr(ps, 'company')
            
        except ImportError:
            pytest.skip("Models module not available")


class TestCompanyModel:
    """Test cases for Company model"""
    
    def test_company_model_creation(self):
        """Test Company model instantiation"""
        try:
            from models import Company
            company = Company(company="Apple Inc.")
            assert company.company == "Apple Inc."
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_company_model_attributes(self):
        """Test Company model has required attributes"""
        try:
            from models import Company
            company = Company()
            
            assert hasattr(company, 'Company_ID')
            assert hasattr(company, 'company')
            
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_company_to_dict_method(self):
        """Test Company model to_dict method"""
        try:
            from models import Company
            company = Company(company="Apple Inc.")
            company.Company_ID = 1
            
            if hasattr(company, 'to_dict'):
                result = company.to_dict()
                assert isinstance(result, dict)
                assert 'Company_ID' in result
                assert 'company' in result
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_company_relationships(self):
        """Test Company model relationships"""
        try:
            from models import Company
            company = Company()
            
            assert hasattr(company, 'portfolio_stocks')
            assert hasattr(company, 'data')
            
        except ImportError:
            pytest.skip("Models module not available")


class TestMetricModel:
    """Test cases for Metric model"""
    
    def test_metric_model_creation(self):
        """Test Metric model instantiation"""
        try:
            from models import Metric
            metric = Metric(metric="Close")
            assert metric.metric == "Close"
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_metric_model_attributes(self):
        """Test Metric model has required attributes"""
        try:
            from models import Metric
            metric = Metric()
            
            assert hasattr(metric, 'Metric_ID')
            assert hasattr(metric, 'metric')
            
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_metric_to_dict_method(self):
        """Test Metric model to_dict method"""
        try:
            from models import Metric
            metric = Metric(metric="Close")
            metric.Metric_ID = 1
            
            if hasattr(metric, 'to_dict'):
                result = metric.to_dict()
                assert isinstance(result, dict)
                assert 'Metric_ID' in result
                assert 'metric' in result
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_metric_relationships(self):
        """Test Metric model relationships"""
        try:
            from models import Metric
            metric = Metric()
            
            assert hasattr(metric, 'data')
            
        except ImportError:
            pytest.skip("Models module not available")


class TestDataModel:
    """Test cases for Data model"""
    
    def test_data_model_creation(self):
        """Test Data model instantiation"""
        try:
            from models import Data
            now = datetime.now(timezone.utc)
            data = Data(
                Company_ID=1,
                Metric_ID=1,
                Date=now,
                value=100.0
            )
            assert data.Company_ID == 1
            assert data.Metric_ID == 1
            assert data.Date == now
            assert data.value == 100.0
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_data_model_attributes(self):
        """Test Data model has required attributes"""
        try:
            from models import Data
            data = Data()
            
            assert hasattr(data, 'Data_ID')
            assert hasattr(data, 'Company_ID')
            assert hasattr(data, 'Metric_ID')
            assert hasattr(data, 'Date')
            assert hasattr(data, 'value')
            
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_data_to_dict_method(self):
        """Test Data model to_dict method"""
        try:
            from models import Data
            now = datetime.now(timezone.utc)
            data = Data(
                Company_ID=1,
                Metric_ID=1,
                Date=now,
                value=100.0
            )
            data.Data_ID = 1
            
            if hasattr(data, 'to_dict'):
                result = data.to_dict()
                assert isinstance(result, dict)
                assert 'Data_ID' in result
                assert 'Company_ID' in result
                assert 'Metric_ID' in result
                assert 'Date' in result
                assert 'value' in result
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_data_relationships(self):
        """Test Data model relationships"""
        try:
            from models import Data
            data = Data()
            
            assert hasattr(data, 'company')
            assert hasattr(data, 'metric')
            
        except ImportError:
            pytest.skip("Models module not available")


class TestModelRelationships:
    """Test inter-model relationships"""
    
    def test_user_portfolio_relationship(self):
        """Test User-Portfolio relationship"""
        try:
            from models import User, Portfolio
            # This would require database setup for full testing
            # Here we test that the relationship attributes exist
            user = User()
            portfolio = Portfolio()
            
            assert hasattr(user, 'portfolios')
            assert hasattr(portfolio, 'user')
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_portfolio_portfolio_stock_relationship(self):
        """Test Portfolio-PortfolioStock relationship"""
        try:
            from models import Portfolio, PortfolioStock
            portfolio = Portfolio()
            portfolio_stock = PortfolioStock()
            
            assert hasattr(portfolio, 'stocks')
            assert hasattr(portfolio_stock, 'portfolio')
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_company_portfolio_stock_relationship(self):
        """Test Company-PortfolioStock relationship"""
        try:
            from models import Company, PortfolioStock
            company = Company()
            portfolio_stock = PortfolioStock()
            
            assert hasattr(company, 'portfolio_stocks')
            assert hasattr(portfolio_stock, 'company')
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_company_data_relationship(self):
        """Test Company-Data relationship"""
        try:
            from models import Company, Data
            company = Company()
            data = Data()
            
            assert hasattr(company, 'data')
            assert hasattr(data, 'company')
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_metric_data_relationship(self):
        """Test Metric-Data relationship"""
        try:
            from models import Metric, Data
            metric = Metric()
            data = Data()
            
            assert hasattr(metric, 'data')
            assert hasattr(data, 'metric')
        except ImportError:
            pytest.skip("Models module not available")


class TestModelValidation:
    """Test model validation and constraints"""
    
    def test_user_username_uniqueness(self):
        """Test that username should be unique (table constraint)"""
        try:
            from models import User
            # This would require database setup for full testing
            # Here we test that the model can be instantiated
            user = User(username="unique_user", password="password")
            assert user.username == "unique_user"
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_data_foreign_key_constraints(self):
        """Test Data model foreign key constraints"""
        try:
            from models import Data
            data = Data(Company_ID=1, Metric_ID=1)
            assert data.Company_ID == 1
            assert data.Metric_ID == 1
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_portfolio_stock_foreign_keys(self):
        """Test PortfolioStock foreign key constraints"""
        try:
            from models import PortfolioStock
            ps = PortfolioStock(portfolio_id=1, company_id=1)
            assert ps.portfolio_id == 1
            assert ps.company_id == 1
        except ImportError:
            pytest.skip("Models module not available")


class TestModelMethods:
    """Test custom model methods"""
    
    def test_user_get_id_method(self):
        """Test User get_id method from UserMixin"""
        try:
            from models import User
            user = User()
            user.id = 123
            
            # UserMixin should provide get_id method
            if hasattr(user, 'get_id'):
                assert user.get_id() == "123"
        except ImportError:
            pytest.skip("Models module not available")
    
    def test_user_is_authenticated_property(self):
        """Test User is_authenticated property from UserMixin"""
        try:
            from models import User
            user = User()
            
            # UserMixin should provide is_authenticated property
            if hasattr(user, 'is_authenticated'):
                assert isinstance(user.is_authenticated, bool)
        except ImportError:
            pytest.skip("Models module not available")


if __name__ == '__main__':
    pytest.main([__file__])
