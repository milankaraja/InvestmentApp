#!/usr/bin/env python3

import requests
import json

# Test the empty portfolio scenario
def test_empty_portfolio():
    # Test login first
    login_data = {
        'email': 'test@example.com',
        'password': 'password123'
    }
    
    session = requests.Session()
    
    # Login
    login_response = session.post('http://127.0.0.1:5000/login', json=login_data)
    print(f"Login status: {login_response.status_code}")
    print(f"Login response: {login_response.text}")
    
    # Test portfolio endpoint
    portfolio_response = session.get('http://127.0.0.1:5000/api/portfolio')
    print(f"Portfolio status: {portfolio_response.status_code}")
    
    if portfolio_response.status_code == 200:
        print("✅ SUCCESS: Empty portfolio handled correctly!")
        portfolio_data = portfolio_response.json()
        print(f"Portfolio data keys: {portfolio_data.keys()}")
    else:
        print(f"❌ ERROR: Portfolio request failed with status {portfolio_response.status_code}")
        print(f"Error response: {portfolio_response.text}")

if __name__ == "__main__":
    test_empty_portfolio()
