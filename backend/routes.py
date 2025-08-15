from app import app, db, bcrypt
from models import User, Stock, Portfolio, PortfolioStock, Company, Metric, Data

from flask import jsonify, request, session
from flask_login import LoginManager, login_user, current_user, logout_user, login_required

import yfinance as yf
import numpy as np
from datetime import datetime, timezone
import portfolio_calculations

#Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'

# Handle preflight OPTIONS requests
@app.before_request
def handle_preflight():
    print(f"DEBUG: Request received - Method: {request.method}, URL: {request.url}, Path: {request.path}")
    if request.method == "OPTIONS":
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", request.headers.get('Origin', '*'))
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    
    # Validate required fields
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    if not username:
        return jsonify({"message": "Username is required"}), 400
    if not password:
        return jsonify({"message": "Password is required"}), 400
    
    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "Username already exists"}), 409
    
    try:
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Registration failed: {str(e)}"}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    
    # Validate required fields
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    username = data.get('username')
    password = data.get('password')
    
    if not username:
        return jsonify({"message": "Username is required"}), 400
    if not password:
        return jsonify({"message": "Password is required"}), 400
    
    try:
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password):
            login_user(user)
            print("User ID in session:", session.get('_user_id'))  # Debug
            print("Session after login:", dict(session))
            return jsonify({"message": "Login successful"}), 200
        return jsonify({"message": "Invalid username or password"}), 401
    except Exception as e:
        return jsonify({"message": f"Login failed: {str(e)}"}), 500

@app.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()   
    return jsonify({"message": "Logout successful"}), 200


@app.route('/current_user', methods=['GET'])
def current_user_info():
    print("Session in current_user:", dict(session))  # Debug
    if current_user.is_authenticated:
        return jsonify({"username": current_user.username}), 200
    else:
        return jsonify({"message": "No user logged in"}), 401

@app.route('/stocks', methods=['GET'])
def get_nifty_stocks():
    nifty = yf.Ticker("^NSEI")
    stocks = nifty.info.get('components', [])
    return jsonify(stocks)





@app.route('/api/data')
def get_all_data():
    # Fetch all data from the Data table
    data = Data.query.limit(10).all()
    return jsonify([item.to_dict() for item in data])

@app.route('/api/companies')
def get_companies():
    with app.app_context():
        companies = Company.query.all()
        return jsonify([company.to_dict() for company in companies])

@app.route('/api/metrics')
def get_metrics():
    metrics = Metric.query.all()
    return jsonify([metric.to_dict() for metric in metrics])




# Assume 'Price' metric has Metric_ID of 1, adjust if different
PRICE_METRIC_ID = 1

@app.route('/api/company/prices/<int:company_id>')
def get_company_prices(company_id):
    prices = Data.query.filter_by(Company_ID=company_id, Metric_ID=PRICE_METRIC_ID).all()
    return jsonify([{'date': p.Date.isoformat(), 'price': p.value} for p in prices])

@app.route('/api/company/stats/<int:company_id>')
def get_company_stats(company_id):
    prices = [p.value for p in Data.query.filter_by(Company_ID=company_id, Metric_ID=PRICE_METRIC_ID).all()]
    if not prices:
        return jsonify({"message": "No price data for this company"}), 404
    
    mean = np.mean(prices)
    variance = np.var(prices)
    return jsonify({
        "mean": mean,
        "variance": variance,
        "count": len(prices)
    })



@app.route('/api/stocks', methods=['POST'])
def add_stock():
    data = request.json
    symbol = data.get('symbol')
    name = data.get('name')
    price = data.get('price')

    if not symbol or not name or not price:
        return jsonify({"message": "Missing required fields"}), 400

    stock = Stock(symbol=symbol, name=name, price=price)
    db.session.add(stock)
    db.session.commit()

    return jsonify({"message": "Stock added successfully"}), 201

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    stocks = Stock.query.all()
    stocks_list = []
    for stock in stocks:
        stocks_list.append({
            'id': stock.id,
            'symbol': stock.symbol,
            'name': stock.name,
            'price': stock.price
        })
    return jsonify(stocks_list), 200

@app.route('/api/portfolio/add', methods=['POST'])
@login_required
def add_to_portfolio():
    print(f"DEBUG: add_to_portfolio called! Method: {request.method}, URL: {request.url}")
    data = request.json
    
    # Validate required fields
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    stock_symbol = data.get('stock_symbol')
    quantity = data.get('quantity')
    purchase_price = data.get('purchase_price')
    date_str = data.get('date')
    
    if not stock_symbol:
        return jsonify({"message": "Stock symbol is required"}), 400
    if not quantity:
        return jsonify({"message": "Quantity is required"}), 400
    if not purchase_price:
        return jsonify({"message": "Purchase price is required"}), 400
    
    # Convert date string to timezone-aware datetime object
    if date_str:
        try:
            date = datetime.fromisoformat(date_str)
            if date.tzinfo is None:
                date = date.replace(tzinfo=timezone.utc)
        except ValueError:
            return jsonify({"message": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
    else:
        date = datetime.now(timezone.utc)

    user = current_user

    # Find or create the company/stock
    stock = Company.query.filter_by(company=stock_symbol).first()
    if not stock:
        # Create a new company entry if it doesn't exist
        # Find the highest existing Company_ID and increment it
        max_id = db.session.query(db.func.max(Company.Company_ID)).scalar() or 0
        stock = Company(
            Company_ID=max_id + 1,
            company=stock_symbol
        )
        db.session.add(stock)
        db.session.commit()

    portfolio = Portfolio.query.filter_by(user_id=user.id).first()
    if not portfolio:
        portfolio = Portfolio(user_id=user.id)
        db.session.add(portfolio)
        db.session.commit()

    try:
        portfolio_stock = PortfolioStock(
            portfolio_id=portfolio.id,
            company_id=stock.Company_ID,
            quantity=quantity,
            purchase_price=purchase_price,
            date=date
        )
        db.session.add(portfolio_stock)
        db.session.commit()
        return jsonify({"message": "Stock added to portfolio"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to add stock to portfolio: {str(e)}"}), 500


@app.route('/api/portfolio/delete/<int:portfolio_stock_id>', methods=['DELETE'])
@login_required
def delete_from_portfolio(portfolio_stock_id):
    portfolio_stock = PortfolioStock.query.get(portfolio_stock_id)
    if not portfolio_stock:
        return jsonify({"message": "Stock not found in portfolio"}), 404

    db.session.delete(portfolio_stock)
    db.session.commit()

    return jsonify({"message": "Stock removed from portfolio"}), 200

@app.route('/api/portfolio/update/<int:portfolio_stock_id>', methods=['PUT'])
@login_required
def update_portfolio(portfolio_stock_id):
    data = request.json
    
    if not data:
        return jsonify({"message": "No data provided"}), 400
    
    quantity = data.get('quantity')
    purchase_price = data.get('purchase_price')
    date_str = data.get('date')

    portfolio_stock = PortfolioStock.query.get(portfolio_stock_id)
    if not portfolio_stock:
        return jsonify({"message": "Stock not found in portfolio"}), 404

    try:
        if quantity is not None:
            portfolio_stock.quantity = quantity
        if purchase_price is not None:
            portfolio_stock.purchase_price = purchase_price
        if date_str:
            try:
                date = datetime.fromisoformat(date_str)
                if date.tzinfo is None:
                    date = date.replace(tzinfo=timezone.utc)
                portfolio_stock.date = date
            except ValueError:
                return jsonify({"message": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400
        
        db.session.commit()
        return jsonify({"message": "Stock updated in portfolio"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": f"Failed to update portfolio: {str(e)}"}), 500    
"""
@app.route('/api/portfolio/<int:user_id>', methods=['GET'])
@login_required
def get_portfolio(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"message": "User not found"}), 404

    portfolio = Portfolio.query.filter_by(user_id=user_id).first()
    if not portfolio:
        return jsonify({"message": "Portfolio not found"}), 404

    portfolio_stocks = PortfolioStock.query.filter_by(portfolio_id=portfolio.id).all()
    stocks = []
    for ps in portfolio_stocks:
        stock = Company.query.get(ps.company_id)
        stocks.append({
            "symbol": stock.Company_ID,
            "name": stock.company,
            "quantity": ps.quantity,
            "purchase_price": ps.purchase_price
        })

    return jsonify({"user": user.username, "portfolio": stocks}), 200
"""

@app.route('/api/portfolio', methods=['GET'])
@login_required
def get_portfolio():
    user = current_user
    portfolio = Portfolio.query.filter_by(user_id=user.id).first()
    #if not portfolio:
        #return jsonify({"stocks_list": [], "portfolio_data": [[], []]}), 200  # Return empty structure

    #portfolio_stocks = PortfolioStock.query.filter_by(portfolio_id=portfolio.id).all()
    # Initialize empty response structure
    stocks_list = []
    portfolio_data = {
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
    if portfolio:
        portfolio_stocks = PortfolioStock.query.filter_by(portfolio_id=portfolio.id).all()
        for ps in portfolio_stocks:
            stock = Company.query.get(ps.company_id)
            stocks_list.append({
                'id': ps.id,
                'symbol': stock.company,
                'quantity': ps.quantity,
                'purchase_price': ps.purchase_price,
                'date': ps.date
            })

    # Call your portfolio calculation function
    calculated_data = portfolio_calculations.main(stocks_list)

        # Ensure calculated_data is valid
    if calculated_data:
        portfolio_data = calculated_data

    return jsonify({"stocks_list": stocks_list, "portfolio_data": portfolio_data}), 200