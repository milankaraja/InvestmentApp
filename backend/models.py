from app import db
from flask_login import UserMixin
from datetime import datetime, timezone

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    portfolios = db.relationship('Portfolio', backref='user', lazy=True)

class Stock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(10), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)

class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    current_value = db.Column(db.Float, default=0.0)
    stocks = db.relationship('PortfolioStock', backref='portfolio', lazy=True)

class PortfolioStock(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    portfolio_id = db.Column(db.Integer, db.ForeignKey('portfolio.id'), nullable=False)
    company_id = db.Column(db.Integer, db.ForeignKey('Companies.Company_ID'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    company = db.relationship('Company', backref='portfolio_stocks')

# Define your models
class Company(db.Model):
    __tablename__ = 'Companies'
    __table_args__ = {'extend_existing': True}
    Company_ID = db.Column(db.Integer, primary_key=True, autoincrement=False)
    company = db.Column(db.String, nullable=False)

    def to_dict(self):
        return {
            'Company_ID': self.Company_ID,
            'company': self.company
        }

class Metric(db.Model):
    __tablename__ = 'Metrics'
    __table_args__ = {'extend_existing': True}
    Metric_ID = db.Column(db.Integer, primary_key=True, autoincrement=False)
    metric = db.Column(db.String, nullable=False)

    def to_dict(self):
        return {
            'Metric_ID': self.Metric_ID,
            'metric': self.metric
        }

class Data(db.Model):
    __tablename__ = 'new_Data'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)  # Added for SQLAlchemy's convenience
    Date = db.Column(db.DateTime, nullable=False)
    Company_ID = db.Column(db.Integer, db.ForeignKey('Companies.Company_ID'), nullable=False)
    Metric_ID = db.Column(db.Integer, db.ForeignKey('Metrics.Metric_ID'), nullable=False)
    value = db.Column(db.Float, nullable=False)

    company = db.relationship('Company', backref=db.backref('data', lazy=True))
    metric = db.relationship('Metric', backref=db.backref('data', lazy=True))

    def to_dict(self):
        return {
            'Date': self.Date.isoformat(),
            'Company_ID': self.Company_ID,
            'Metric_ID': self.Metric_ID,
            'value': self.value
        }

   