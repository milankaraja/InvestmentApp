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

"""
CORS(app, supports_credentials=True , origins=["https://655c-117-206-252-168.ngrok-free.app/"],
    "methods": ["GET", "POST", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"])
"""
# Enable CORS for React app running on a different port

CORS(app, supports_credentials=True)
#CORS(app)

"""
CORS(app, resources={r"/*": {
    "origins": "https://655c-117-206-252-168.ngrok-free.app",
    "supports_credentials": True
}})

"""



"""
CORS(app, resources={r"/*": {
    "origins": "https://655c-117-206-252-168.ngrok-free.app/",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

"""


# , origins=["http://localhost:3000"]
# Set the secret key to a random value
app.config['SECRET_KEY'] = 'f5c8b3c1b638b6a25a63bff0794c3915'
#app.secret_key = 'f5c8b3c1b638b6a25a63bff0794c3915'

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'stock_data.db')
#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///stock_data2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# In app.py or wherever app is configured
app.config['SESSION_COOKIE_SECURE'] = True  # For local HTTP testing
app.config['SESSION_COOKIE_SAMESITE'] = 'None' #'Lax'  # Default, but explicit for clarity
app.config['SESSION_COOKIE_HTTPONLY'] = True  # Good practice
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

if __name__ == '__main__':
    app.run(debug=True)

