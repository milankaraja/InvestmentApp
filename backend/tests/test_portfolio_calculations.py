"""
Comprehensive Unit Tests for Portfolio Calculations (portfolio_calculations.py)

Tests all classes and methods including Trade, Portfolio, RiskMetrics,
PortfolioOptimizer, and data provider functionality.
"""

import pytest
import sys
import os
import numpy as np
import pandas as pd
from unittest.mock import patch, MagicMock
from datetime import datetime, date, timedelta, timezone

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


class TestTradeClass:
    """Test cases for Trade class"""
    
    def test_trade_creation(self):
        """Test Trade object creation"""
        try:
            from portfolio_calculations import Trade
            trade = Trade(1, "AAPL", 150.0, 10, datetime.now(timezone.utc))
            assert trade.id == 1
            assert trade.symbol == "AAPL"
            assert trade.purchase_price == 150.0
            assert trade.quantity == 10
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_trade_string_representation(self):
        """Test Trade string representation"""
        try:
            from portfolio_calculations import Trade
            trade = Trade(1, "AAPL", 150.0, 10, datetime.now(timezone.utc))
            assert "AAPL" in str(trade)
            assert "150.0" in str(trade)
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    @patch('portfolio_calculations.PortfolioValueProvider')
    def test_trade_last_price(self, mock_provider):
        """Test Trade lastPrice method"""
        try:
            from portfolio_calculations import Trade
            
            # Mock the value provider
            mock_provider_instance = MagicMock()
            mock_provider_instance.get_asset_value.return_value = 160.0
            mock_provider.return_value = mock_provider_instance
            
            trade = Trade(1, "AAPL", 150.0, 10, datetime.now(timezone.utc))
            last_price = trade.lastPrice()
            
            # Should return mocked price
            assert last_price == 160.0
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    @patch('portfolio_calculations.PortfolioValueProvider')
    def test_trade_total_value_new(self, mock_provider):
        """Test Trade totalValueNew method"""
        try:
            from portfolio_calculations import Trade
            
            # Mock the value provider
            mock_provider_instance = MagicMock()
            mock_provider_instance.get_asset_value.return_value = 160.0
            mock_provider.return_value = mock_provider_instance
            
            trade = Trade(1, "AAPL", 150.0, 10, datetime.now(timezone.utc))
            total_value = trade.totalValueNew()
            
            # Should return quantity * last_price = 10 * 160.0 = 1600.0
            assert total_value == 1600.0
        except ImportError:
            pytest.skip("Portfolio calculations module not available")


class TestTradeFactory:
    """Test cases for TradeFactory class"""
    
    def test_trade_factory_creation(self):
        """Test TradeFactory creates Trade objects"""
        try:
            from portfolio_calculations import TradeFactory
            factory = TradeFactory()
            trade = factory.create_trade(1, "AAPL", 150.0, 10, datetime.now(timezone.utc))
            
            assert trade.id == 1
            assert trade.symbol == "AAPL"
            assert trade.purchase_price == 150.0
            assert trade.quantity == 10
        except ImportError:
            pytest.skip("Portfolio calculations module not available")


class TestPortfolioClass:
    """Test cases for Portfolio class"""
    
    def test_portfolio_creation(self):
        """Test Portfolio object creation"""
        try:
            from portfolio_calculations import Portfolio
            portfolio = Portfolio()
            assert portfolio.trades == []
            assert portfolio.net_values is None
            assert portfolio.portfolio_status == {}
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    @patch('portfolio_calculations.PortfolioValueProvider')
    def test_portfolio_add_trade(self, mock_provider):
        """Test adding trade to portfolio"""
        try:
            from portfolio_calculations import Portfolio, Trade
            
            portfolio = Portfolio()
            trade = Trade(1, "AAPL", 150.0, 10, datetime.now(timezone.utc))
            
            portfolio.add_trade(trade)
            
            assert len(portfolio.trades) == 1
            assert portfolio.trades[0] == trade
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    @patch('portfolio_calculations.PortfolioValueProvider')
    def test_portfolio_add_trades(self, mock_provider):
        """Test adding multiple trades to portfolio"""
        try:
            from portfolio_calculations import Portfolio
            
            portfolio = Portfolio()
            trade_data = [
                {'id': 1, 'symbol': 'AAPL', 'purchase_price': 150.0, 'quantity': 10, 'date': datetime.now(timezone.utc)},
                {'id': 2, 'symbol': 'GOOGL', 'purchase_price': 2500.0, 'quantity': 5, 'date': datetime.now(timezone.utc)}
            ]
            
            portfolio.add_trades(trade_data)
            
            assert len(portfolio.trades) == 2
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    @patch('portfolio_calculations.PortfolioValueProvider')
    def test_portfolio_calculate_net(self, mock_provider):
        """Test portfolio net calculation"""
        try:
            from portfolio_calculations import Portfolio, Trade
            
            # Mock the value provider
            mock_provider_instance = MagicMock()
            mock_provider_instance.get_asset_value.return_value = 160.0
            mock_provider.return_value = mock_provider_instance
            
            portfolio = Portfolio()
            trade = Trade(1, "AAPL", 150.0, 10, datetime.now(timezone.utc))
            portfolio.add_trade(trade)
            
            net_values = portfolio.calculate_net()
            
            # Should return tuple of (net_value, total_quantity, average_price, current_value)
            assert isinstance(net_values, tuple)
            assert len(net_values) == 4
        except ImportError:
            pytest.skip("Portfolio calculations module not available")


class TestPortfolioValueProvider:
    """Test cases for PortfolioValueProvider class"""
    
    @patch('portfolio_calculations.sqlite3.connect')
    def test_portfolio_value_provider_creation(self, mock_connect):
        """Test PortfolioValueProvider object creation"""
        try:
            from portfolio_calculations import PortfolioValueProvider
            
            # Mock database connection
            mock_conn = MagicMock()
            mock_cursor = MagicMock()
            mock_conn.cursor.return_value = mock_cursor
            mock_connect.return_value = mock_conn
            
            provider = PortfolioValueProvider()
            
            assert provider.conn == mock_conn
            assert provider.cursor == mock_cursor
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    @patch('portfolio_calculations.sqlite3.connect')
    def test_get_asset_value(self, mock_connect):
        """Test getting single asset value"""
        try:
            from portfolio_calculations import PortfolioValueProvider
            
            # Mock database connection and cursor
            mock_conn = MagicMock()
            mock_cursor = MagicMock()
            mock_cursor.fetchone.return_value = (150.0,)
            mock_conn.cursor.return_value = mock_cursor
            mock_connect.return_value = mock_conn
            
            provider = PortfolioValueProvider()
            value = provider.get_asset_value("AAPL", "Close", date.today(), date.today())
            
            assert value == 150.0
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    @patch('portfolio_calculations.sqlite3.connect')
    def test_get_asset_values(self, mock_connect):
        """Test getting multiple asset values"""
        try:
            from portfolio_calculations import PortfolioValueProvider
            
            # Mock database connection and cursor
            mock_conn = MagicMock()
            mock_cursor = MagicMock()
            mock_cursor.fetchall.return_value = [
                ('2023-01-01', 150.0),
                ('2023-01-02', 155.0)
            ]
            mock_conn.cursor.return_value = mock_cursor
            mock_connect.return_value = mock_conn
            
            provider = PortfolioValueProvider()
            values = provider.get_asset_values("AAPL", "Close", date.today(), date.today())
            
            assert isinstance(values, dict)
            assert len(values) == 2
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_exchange_rate_retrieval(self):
        """Test exchange rate retrieval"""
        try:
            from portfolio_calculations import PortfolioValueProvider
            
            # Test getting exchange rate
            rate = PortfolioValueProvider.get_exchange_rate('USA', 'USD')
            assert rate == 1.0
            
            rate = PortfolioValueProvider.get_exchange_rate('India', 'INR')
            assert rate == 1.0
        except ImportError:
            pytest.skip("Portfolio calculations module not available")


class TestRiskMetrics:
    """Test cases for RiskMetrics class"""
    
    def test_risk_metrics_creation(self):
        """Test RiskMetrics object creation"""
        try:
            from portfolio_calculations import RiskMetrics
            
            price_array = [100, 105, 95, 110, 90]
            portfolio_value = 10000
            
            risk_metrics = RiskMetrics(price_array, portfolio_value)
            
            assert risk_metrics.price_array == price_array
            assert risk_metrics.portfolio_value == portfolio_value
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_risk_metrics_mean(self):
        """Test mean calculation"""
        try:
            from portfolio_calculations import RiskMetrics
            
            price_array = [100, 105, 95, 110, 90]
            risk_metrics = RiskMetrics(price_array, 10000)
            
            mean = risk_metrics.mean()
            expected_mean = np.mean(price_array)
            
            assert mean == expected_mean
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_risk_metrics_variance(self):
        """Test variance calculation"""
        try:
            from portfolio_calculations import RiskMetrics
            
            price_array = [100, 105, 95, 110, 90]
            risk_metrics = RiskMetrics(price_array, 10000)
            
            variance = risk_metrics.variance()
            expected_variance = np.var(price_array)
            
            assert variance == expected_variance
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_risk_metrics_standard_deviation(self):
        """Test standard deviation calculation"""
        try:
            from portfolio_calculations import RiskMetrics
            
            price_array = [100, 105, 95, 110, 90]
            risk_metrics = RiskMetrics(price_array, 10000)
            
            std_dev = risk_metrics.standard_deviation()
            expected_std = np.std(price_array)
            
            assert std_dev == expected_std
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_risk_metrics_max_min_price(self):
        """Test max and min price calculation"""
        try:
            from portfolio_calculations import RiskMetrics
            
            price_array = [100, 105, 95, 110, 90]
            risk_metrics = RiskMetrics(price_array, 10000)
            
            max_price = risk_metrics.max_price()
            min_price = risk_metrics.min_price()
            
            assert max_price == 110
            assert min_price == 90
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_risk_metrics_sharpe_ratio(self):
        """Test Sharpe ratio calculation"""
        try:
            from portfolio_calculations import RiskMetrics
            
            price_array = [100, 105, 95, 110, 90, 95, 100]
            risk_metrics = RiskMetrics(price_array, 10000)
            
            sharpe_ratio = risk_metrics.sharpe_ratio()
            
            # Should return a numeric value
            assert isinstance(sharpe_ratio, (int, float))
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_risk_metrics_sortino_ratio(self):
        """Test Sortino ratio calculation"""
        try:
            from portfolio_calculations import RiskMetrics
            
            price_array = [100, 105, 95, 110, 90, 95, 100]
            risk_metrics = RiskMetrics(price_array, 10000)
            
            sortino_ratio = risk_metrics.sortino_ratio()
            
            # Should return a numeric value
            assert isinstance(sortino_ratio, (int, float))
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_risk_metrics_value_at_risk(self):
        """Test Value at Risk calculation"""
        try:
            from portfolio_calculations import RiskMetrics
            
            price_array = [100, 105, 95, 110, 90, 95, 100]
            risk_metrics = RiskMetrics(price_array, 10000)
            
            var = risk_metrics.value_at_risk()
            var_dollar = risk_metrics.value_at_risk_dollar()
            
            # Should return numeric values
            assert isinstance(var, (int, float))
            assert isinstance(var_dollar, (int, float))
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_risk_metrics_monte_carlo_var(self):
        """Test Monte Carlo VaR calculation"""
        try:
            from portfolio_calculations import RiskMetrics
            
            price_array = [100, 105, 95, 110, 90, 95, 100]
            risk_metrics = RiskMetrics(price_array, 10000)
            
            var_dollar, simulated_returns = risk_metrics.monte_carlo_var(num_simulations=100)
            
            # Should return VaR value and array of simulated returns
            assert isinstance(var_dollar, (int, float))
            assert isinstance(simulated_returns, np.ndarray)
            assert len(simulated_returns) == 100
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_risk_metrics_rolling_std_dev(self):
        """Test rolling standard deviation calculation"""
        try:
            from portfolio_calculations import RiskMetrics
            
            # Create longer price array for rolling window
            price_array = list(range(100, 150))
            risk_metrics = RiskMetrics(price_array, 10000)
            
            rolling_std = risk_metrics.rolling_std_dev(window=10)
            
            # Should return list of rolling standard deviations
            assert isinstance(rolling_std, list)
        except ImportError:
            pytest.skip("Portfolio calculations module not available")


class TestPortfolioOptimizer:
    """Test cases for PortfolioOptimizer class"""
    
    @patch('portfolio_calculations.PortfolioValueProvider')
    def test_portfolio_optimizer_creation(self, mock_provider):
        """Test PortfolioOptimizer object creation"""
        try:
            from portfolio_calculations import PortfolioOutput, Portfolio, PortfolioOptimizer
            
            # Mock portfolio with some data
            portfolio = Portfolio()
            portfolio_output = PortfolioOutput(portfolio, "USD")
            
            # Mock price history
            with patch.object(portfolio_output, 'portfolio_price_history') as mock_price_history:
                mock_df = pd.DataFrame({
                    'AAPL': [150, 155, 160],
                    'GOOGL': [2500, 2550, 2600]
                })
                mock_price_history.return_value = mock_df
                
                optimizer = PortfolioOptimizer(portfolio_output)
                
                assert optimizer.portfolio_output == portfolio_output
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    @patch('portfolio_calculations.PortfolioValueProvider')
    def test_portfolio_performance_calculation(self, mock_provider):
        """Test portfolio performance calculation"""
        try:
            from portfolio_calculations import PortfolioOutput, Portfolio, PortfolioOptimizer
            
            portfolio = Portfolio()
            portfolio_output = PortfolioOutput(portfolio, "USD")
            
            # Mock price history
            with patch.object(portfolio_output, 'portfolio_price_history') as mock_price_history:
                mock_df = pd.DataFrame({
                    'AAPL': [150, 155, 160],
                    'GOOGL': [2500, 2550, 2600]
                })
                mock_price_history.return_value = mock_df
                
                optimizer = PortfolioOptimizer(portfolio_output)
                weights = np.array([0.5, 0.5])
                
                ret, std = optimizer.portfolio_performance(weights)
                
                assert isinstance(ret, (int, float))
                assert isinstance(std, (int, float))
        except ImportError:
            pytest.skip("Portfolio calculations module not available")


class TestOutputForPHP:
    """Test cases for OutputForPHP class"""
    
    @patch('portfolio_calculations.PortfolioValueProvider')
    def test_output_for_php_creation(self, mock_provider):
        """Test OutputForPHP object creation"""
        try:
            from portfolio_calculations import OutputForPHP
            
            output = OutputForPHP("USD")
            
            assert output.currency == "USD"
            assert output.output_list == []
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    @patch('portfolio_calculations.PortfolioValueProvider')
    def test_output_portfolio_processing(self, mock_provider):
        """Test portfolio output processing"""
        try:
            from portfolio_calculations import OutputForPHP
            
            # Mock the value provider
            mock_provider_instance = MagicMock()
            mock_provider_instance.get_asset_value.return_value = 160.0
            mock_provider_instance.get_asset_values.return_value = {
                '2023-01-01': 150.0,
                '2023-01-02': 155.0
            }
            mock_provider.return_value = mock_provider_instance
            
            output = OutputForPHP("USD")
            trade_data = [
                {'id': 1, 'symbol': 'AAPL', 'purchase_price': 150.0, 'quantity': 10, 'date': datetime.now(timezone.utc)}
            ]
            
            result = output.output_portfolio(trade_data)
            
            # Should return dictionary with required keys
            assert isinstance(result, dict)
            expected_keys = [
                "dates", "prices", "risk_metrics", "portfolio_consolidated",
                "portfolio_purchase_price", "portfolio_stock_names",
                "portfolio_current_value", "price_history", "stock_quantity",
                "optimizations"
            ]
            for key in expected_keys:
                assert key in result
        except ImportError:
            pytest.skip("Portfolio calculations module not available")


class TestMainFunction:
    """Test cases for main function"""
    
    @patch('portfolio_calculations.OutputForPHP')
    def test_main_function(self, mock_output_php):
        """Test main function execution"""
        try:
            from portfolio_calculations import main
            
            # Mock OutputForPHP
            mock_output_instance = MagicMock()
            mock_output_instance.output_portfolio.return_value = {"test": "data"}
            mock_output_php.return_value = mock_output_instance
            
            trade_data = [
                {'id': 1, 'symbol': 'AAPL', 'purchase_price': 150.0, 'quantity': 10, 'date': datetime.now(timezone.utc)}
            ]
            
            result = main(trade_data)
            
            # Should return processed portfolio data
            assert isinstance(result, dict)
        except ImportError:
            pytest.skip("Portfolio calculations module not available")


class TestEdgeCases:
    """Test edge cases and error handling"""
    
    def test_empty_price_array_risk_metrics(self):
        """Test RiskMetrics with empty price array"""
        try:
            from portfolio_calculations import RiskMetrics
            
            risk_metrics = RiskMetrics([], 0)
            
            # Should handle empty arrays gracefully
            assert risk_metrics.mean() == 0
            assert risk_metrics.variance() == 0
            assert risk_metrics.standard_deviation() == 0
            assert risk_metrics.max_price() == 0
            assert risk_metrics.min_price() == 0
            assert risk_metrics.sharpe_ratio() == 0
            assert risk_metrics.sortino_ratio() == 0
            assert risk_metrics.value_at_risk() == 0
        except ImportError:
            pytest.skip("Portfolio calculations module not available")
    
    def test_single_price_risk_metrics(self):
        """Test RiskMetrics with single price"""
        try:
            from portfolio_calculations import RiskMetrics
            
            risk_metrics = RiskMetrics([100], 1000)
            
            # Should handle single price gracefully
            assert risk_metrics.mean() == 100
            assert risk_metrics.max_price() == 100
            assert risk_metrics.min_price() == 100
        except ImportError:
            pytest.skip("Portfolio calculations module not available")


if __name__ == '__main__':
    pytest.main([__file__])
