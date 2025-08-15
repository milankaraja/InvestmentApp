from flask import Flask, request, jsonify
#import flask_sqlalchemy
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
#from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import yfinance as yf
from flask_login import LoginManager

from flask_cors import CORS


import os
basedir = os.path.abspath(os.path.dirname(__file__))



app = Flask(__name__)

# Configure CORS for local development
CORS(app, 
     origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
     supports_credentials=True,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"])
# Set the secret key to a random value
app.config['SECRET_KEY'] = 'f5c8b3c1b638b6a25a63bff0794c3915'
#app.secret_key = 'f5c8b3c1b638b6a25a63bff0794c3915'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'stock_data.db')
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///stock_data2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Session configuration for local development
app.config['SESSION_COOKIE_SECURE'] = False  # Set to False for local HTTP development
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # More permissive for local development
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Keep this for security
app.config['SESSION_COOKIE_PATH'] = '/'  # Ensure cookie applies to all routes

db = SQLAlchemy(app)
migrate = Migrate(app, db)
bcrypt = Bcrypt(app)


#login_manager = LoginManager(app)
#login_manager.login_view = 'login'
#login_manager.login_message_category = 'info'



from routes import *

# Create all tables if they don't exist (for development)
with app.app_context():
    db.create_all()

# Debug: Print all registered routes
with app.app_context():
    print("Registered routes:")
    for rule in app.url_map.iter_rules():
        print(f"  {rule.rule} [{', '.join(rule.methods)}]")

if __name__ == '__main__':
    app.run(debug=True)

