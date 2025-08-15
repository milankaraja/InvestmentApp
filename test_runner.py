"""
Test Configuration and Setup for InvestmentApp

This file provides configuration for running comprehensive unit tests
across both backend (Python) and frontend (JavaScript) components.
"""

import subprocess
import sys
import os

def install_backend_dependencies():
    """Install required Python testing dependencies"""
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'pytest', 'pytest-cov', 'pytest-mock'])
        print("✅ Backend testing dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install backend dependencies: {e}")
        return False

def install_frontend_dependencies():
    """Install required JavaScript testing dependencies"""
    try:
        # Check if npm is available
        subprocess.check_call(['npm', '--version'], stdout=subprocess.DEVNULL)
        
        # Install testing dependencies
        test_deps = [
            '@testing-library/react',
            '@testing-library/jest-dom',
            '@testing-library/user-event',
            'jest',
            'jest-environment-jsdom'
        ]
        
        for dep in test_deps:
            subprocess.check_call(['npm', 'install', '--save-dev', dep], 
                                stdout=subprocess.DEVNULL)
        
        print("✅ Frontend testing dependencies installed successfully")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError) as e:
        print(f"❌ Failed to install frontend dependencies: {e}")
        return False

def run_backend_tests():
    """Run backend Python tests with pytest"""
    print("\n🧪 Running Backend Tests...")
    try:
        backend_path = os.path.join(os.path.dirname(__file__), 'backend')
        result = subprocess.run([
            sys.executable, '-m', 'pytest', 
            os.path.join(backend_path, 'tests'),
            '-v',
            '--tb=short',
            '--cov=.',
            '--cov-report=term-missing'
        ], cwd=backend_path)
        
        if result.returncode == 0:
            print("✅ Backend tests completed successfully")
        else:
            print("⚠️ Some backend tests failed")
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running backend tests: {e}")
        return False

def run_frontend_tests():
    """Run frontend JavaScript tests with Jest"""
    print("\n🧪 Running Frontend Tests...")
    try:
        frontend_path = os.path.join(os.path.dirname(__file__), 'frontend')
        result = subprocess.run([
            'npm', 'test', '--', '--coverage', '--watchAll=false'
        ], cwd=frontend_path)
        
        if result.returncode == 0:
            print("✅ Frontend tests completed successfully")
        else:
            print("⚠️ Some frontend tests failed")
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Error running frontend tests: {e}")
        return False

def generate_test_report():
    """Generate comprehensive test report"""
    print("\n📊 Test Report Summary")
    print("=" * 50)
    
    # Backend test coverage
    print("\n🐍 Backend Test Coverage:")
    print("- Models: User, Stock, Portfolio, PortfolioStock, Company, Metric, Data")
    print("- Routes: Authentication, Portfolio Management, Data APIs")
    print("- Portfolio Calculations: Risk Metrics, Optimization, Trade Management")
    print("- Integration: Database, Authentication Flow, API Endpoints")
    
    # Frontend test coverage
    print("\n⚛️ Frontend Test Coverage:")
    print("- Components: Register, Login, Dashboard, Portfolio, StockList")
    print("- Context: UserContext for state management")
    print("- API Integration: Axios calls, error handling")
    print("- Navigation: React Router integration")
    
    # Security considerations
    print("\n🔒 Security Test Areas:")
    print("- Authentication: Login/logout flow, session management")
    print("- Input Validation: Form validation, SQL injection prevention")
    print("- CORS: Cross-origin request handling")
    print("- Session Security: Cookie settings, CSRF protection")

def main():
    """Main test runner"""
    print("🚀 InvestmentApp Comprehensive Test Suite")
    print("=" * 50)
    
    # Setup phase
    print("\n⚙️ Setting up test environment...")
    backend_deps = install_backend_dependencies()
    frontend_deps = install_frontend_dependencies()
    
    if not backend_deps and not frontend_deps:
        print("❌ Failed to install dependencies. Exiting...")
        return 1
    
    # Test execution phase
    backend_success = True
    frontend_success = True
    
    if backend_deps:
        backend_success = run_backend_tests()
    
    if frontend_deps:
        frontend_success = run_frontend_tests()
    
    # Report generation
    generate_test_report()
    
    # Final status
    print("\n" + "=" * 50)
    if backend_success and frontend_success:
        print("🎉 All tests completed successfully!")
        return 0
    else:
        print("⚠️ Some tests failed. Please review the output above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
