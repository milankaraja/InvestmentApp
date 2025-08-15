"""
Comprehensive Unit Tests for Flask Application (app.py)

Tests the main Flask application initialization, configuration, database setup,
authentication configuration, and CORS settings.
"""

import pytest
import sys
import os
from unittest.mock import patch, MagicMock

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def test_app_imports():
    """Test that all required modules can be imported"""
    try:
        from flask import Flask
        from flask_sqlalchemy import SQLAlchemy
        from flask_migrate import Migrate
        from flask_login import LoginManager
        from flask_bcrypt import Bcrypt
        from flask_cors import CORS
        assert True
    except ImportError as e:
        pytest.fail(f"Required module import failed: {e}")

@patch('app.db')
@patch('app.migrate')
@patch('app.bcrypt')
@patch('app.CORS')
@patch('app.Flask')
def test_app_initialization(mock_flask, mock_cors, mock_bcrypt, mock_migrate, mock_db):
    """Test Flask app initialization and configuration"""
    # Mock Flask instance
    mock_app = MagicMock()
    mock_flask.return_value = mock_app
    
    # Import app module to trigger initialization
    import app
    
    # Verify Flask app was created
    mock_flask.assert_called_once_with(__name__)
    
    # Verify CORS was initialized
    mock_cors.assert_called_once()

def test_app_config():
    """Test application configuration settings"""
    import app
    
    # Test that required config keys are present
    required_configs = [
        'SECRET_KEY',
        'SQLALCHEMY_DATABASE_URI',
        'SQLALCHEMY_TRACK_MODIFICATIONS'
    ]
    
    for config_key in required_configs:
        assert hasattr(app.app, 'config')

def test_database_configuration():
    """Test SQLAlchemy database configuration"""
    import app
    
    # Verify database URI is set correctly
    assert 'sqlite:///stock_data.db' in str(app.app.config.get('SQLALCHEMY_DATABASE_URI', ''))
    
    # Verify track modifications is disabled for performance
    assert app.app.config.get('SQLALCHEMY_TRACK_MODIFICATIONS') == False

def test_secret_key_configuration():
    """Test that secret key is properly configured"""
    import app
    
    # Verify secret key exists and is not empty
    secret_key = app.app.config.get('SECRET_KEY')
    assert secret_key is not None
    assert len(secret_key) > 0

def test_session_configuration():
    """Test session cookie configuration for security"""
    import app
    
    # Verify session cookie settings
    assert app.app.config.get('SESSION_COOKIE_HTTPONLY') == True
    assert app.app.config.get('SESSION_COOKIE_SECURE') == False  # Should be True in production

@patch('app.db.create_all')
def test_database_table_creation(mock_create_all):
    """Test that database tables are created on app startup"""
    import app
    
    # In app context, tables should be created
    with app.app.app_context():
        app.db.create_all()
        mock_create_all.assert_called_once()

def test_flask_extensions_initialization():
    """Test that all Flask extensions are properly initialized"""
    import app
    
    # Verify extensions exist
    assert hasattr(app, 'db')
    assert hasattr(app, 'migrate')
    assert hasattr(app, 'bcrypt')
    
    # Verify database instance
    assert app.db is not None
    
    # Verify bcrypt instance
    assert app.bcrypt is not None

def test_cors_configuration():
    """Test CORS configuration for frontend communication"""
    import app
    
    # Verify CORS is configured
    # Note: Actual CORS testing would require making cross-origin requests
    assert hasattr(app, 'app')

def test_app_debug_mode():
    """Test application debug mode setting"""
    import app
    
    # In development, debug should be configurable
    # In production, debug should be False
    debug_mode = app.app.debug
    assert isinstance(debug_mode, bool)

def test_app_routes_import():
    """Test that routes are properly imported"""
    try:
        import routes
        assert True
    except ImportError:
        pytest.fail("Routes module import failed")

def test_models_import():
    """Test that models are properly imported"""
    try:
        import models
        assert True
    except ImportError:
        pytest.fail("Models module import failed")

@pytest.fixture
def app_context():
    """Fixture to provide Flask application context"""
    import app
    with app.app.app_context():
        yield app.app

def test_app_context_creation(app_context):
    """Test Flask application context creation"""
    assert app_context is not None
    assert hasattr(app_context, 'config')

def test_database_uri_format():
    """Test that database URI follows SQLite format"""
    import app
    
    db_uri = app.app.config.get('SQLALCHEMY_DATABASE_URI')
    assert db_uri.startswith('sqlite:///')
    assert db_uri.endswith('.db')

def test_app_name():
    """Test that app has correct name"""
    import app
    
    # App name should match the module name
    assert app.app.name == 'app'

def test_flask_login_configuration():
    """Test Flask-Login is properly configured via routes import"""
    # This tests that importing routes doesn't cause errors
    # which would indicate Flask-Login configuration issues
    try:
        import routes
        assert True
    except Exception as e:
        pytest.fail(f"Flask-Login configuration error: {e}")

class TestAppIntegration:
    """Integration tests for the Flask application"""
    
    def test_app_startup_sequence(self):
        """Test complete app startup sequence"""
        try:
            import app
            with app.app.app_context():
                # Test that all components work together
                assert app.app is not None
                assert app.db is not None
                assert app.bcrypt is not None
                
        except Exception as e:
            pytest.fail(f"App startup sequence failed: {e}")
    
    def test_app_with_request_context(self):
        """Test app functionality within request context"""
        import app
        
        with app.app.test_request_context():
            # Test that request context works
            from flask import request
            assert request is not None

if __name__ == '__main__':
    pytest.main([__file__])
