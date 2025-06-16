# InvestmentApp

# Investment Portfolio Management Application

This is a web-based **Investment Portfolio Management Application** that allows users to manage their stock portfolios, analyze risk metrics, and optimize their investments using various financial models. The application provides interactive visualizations and tools to help users make informed investment decisions.

---

## Features

### **1. Portfolio Management**
- Add, edit, and delete stocks in your portfolio.
- View portfolio details, including:
  - Stock symbols
  - Quantity of stocks
  - Purchase price
  - Current value

### **2. Data Visualization**
- **Pie Charts**: Visualize portfolio composition by stock allocation.
- **Line Charts**: Track portfolio value over time.
- **Bar Charts**: Compare risk metrics like Value at Risk (VaR) and Monte Carlo simulations.

### **3. Risk Management**
- Analyze key risk metrics:
  - Sharpe Ratio
  - Sortino Ratio
  - Rolling Volatility
  - Value at Risk (VaR)
- Visualize risk metrics using interactive charts.

### **4. Portfolio Optimization**
- Optimize your portfolio using financial models:
  - Sharpe Ratio
  - Mean-Variance Optimization
  - Maximum Return
  - Sortino Ratio
  - CVaR (Conditional Value at Risk)
  - Diversification
- View optimal allocation with pie charts and metrics tables.
- Visualize additional metrics like efficient frontiers, downside histograms, and drawdown charts.

---

## Tech Stack

### **Frontend**
- **React**: For building the user interface.
- **Recharts**: For creating interactive charts.
- **React Tabs**: For organizing content into tabs.
- **Axios**: For making API requests.

### **Backend**
- **Flask**: For handling API requests and serving data.
- **SQLAlchemy**: For database interactions.
- **Pandas**: For financial data processing and calculations.

---

## Installation

### **1. Clone the Repository**
```bash
git clone https://github.com/milankaraja/investment-portfolio-app.git
cd investment-portfolio-app
