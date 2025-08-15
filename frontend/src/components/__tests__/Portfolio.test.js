/**
 * Comprehensive Test Suite for Portfolio Component
 * Tests data visualization, CRUD operations, portfolio analytics,
 * chart rendering, API integration, and error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import Portfolio from '../Portfolio';

// Mock react-tabs
jest.mock('react-tabs', () => ({
  Tab: ({ children }) => <div role="tab">{children}</div>,
  Tabs: ({ children }) => <div role="tablist">{children}</div>,
  TabList: ({ children }) => <div role="tablist">{children}</div>,
  TabPanel: ({ children }) => <div role="tabpanel">{children}</div>,
}));

// Mock recharts components
jest.mock('recharts', () => ({
  PieChart: ({ children, ...props }) => (
    <div data-testid="pie-chart" data-width={props.width} data-height={props.height}>
      {children}
    </div>
  ),
  Pie: ({ data, dataKey, nameKey, ...props }) => (
    <div data-testid="pie" data-datakey={dataKey} data-namekey={nameKey}>
      {data && data.map((item, index) => (
        <div key={index} data-testid={`pie-item-${index}`}>
          {item[nameKey]}: {item[dataKey]}
        </div>
      ))}
    </div>
  ),
  Cell: ({ fill }) => <div data-testid="pie-cell" data-fill={fill}></div>,
  LineChart: ({ children, data, ...props }) => (
    <div data-testid="line-chart" data-width={props.width} data-height={props.height}>
      {data && data.map((item, index) => (
        <div key={index} data-testid={`line-data-${index}`}>
          {JSON.stringify(item)}
        </div>
      ))}
      {children}
    </div>
  ),
  Line: ({ dataKey, stroke, name }) => (
    <div data-testid="line" data-datakey={dataKey} data-stroke={stroke} data-name={name}></div>
  ),
  BarChart: ({ children, data, ...props }) => (
    <div data-testid="bar-chart" data-width={props.width} data-height={props.height}>
      {data && data.map((item, index) => (
        <div key={index} data-testid={`bar-data-${index}`}>
          {JSON.stringify(item)}
        </div>
      ))}
      {children}
    </div>
  ),
  Bar: ({ dataKey, fill }) => (
    <div data-testid="bar" data-datakey={dataKey} data-fill={fill}></div>
  ),
  XAxis: ({ dataKey }) => <div data-testid="x-axis" data-datakey={dataKey}></div>,
  YAxis: ({ width, tickFormatter, domain }) => (
    <div data-testid="y-axis" data-width={width} data-domain={JSON.stringify(domain)}></div>
  ),
  CartesianGrid: ({ stroke, strokeDasharray }) => (
    <div data-testid="cartesian-grid" data-stroke={stroke} data-stroke-dasharray={strokeDasharray}></div>
  ),
  Tooltip: ({ formatter }) => <div data-testid="tooltip"></div>,
  Legend: ({ layout, align, verticalAlign }) => (
    <div data-testid="legend" data-layout={layout} data-align={align} data-vertical-align={verticalAlign}></div>
  ),
}));

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    REACT_APP_BACKEND_URL: 'http://localhost:5000',
  };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

// Mock data
const mockPortfolioData = [
  {
    id: 1,
    symbol: 'AAPL',
    quantity: 10,
    purchase_price: 150.00,
    date: '2023-01-01',
  },
  {
    id: 2,
    symbol: 'GOOGL',
    quantity: 5,
    purchase_price: 2500.00,
    date: '2023-02-01',
  },
];

const mockPortfolioResults = {
  portfolio_stock_names: ['AAPL', 'GOOGL'],
  portfolio_current_value: [1600, 12500],
  dates: ['2023-01-01', '2023-01-02', '2023-01-03'],
  prices: [14100, 14250, 14300],
  portfolio_consolidated: [
    ['AAPL', [10, 1500, 160, 1600]],
    ['GOOGL', [5, 12500, 2500, 12500]],
  ],
  risk_metrics: {
    value_at_risk_dollar: 500,
    monte_carlo_var: 450,
    sharpe_ratio: 1.2,
    sortino_ratio: 1.5,
    monte_carlo_simulated_returns: [0.1, 0.05, -0.02, 0.08, -0.01],
    rolling_std_dev: [0.02, 0.025, 0.03, 0.028, 0.032],
  },
  optimizations: {
    sharpe: {
      optimal_weights: { AAPL: 0.6, GOOGL: 0.4 },
      expected_return: 0.12,
      risk: 0.15,
      visualizations: {
        efficient_frontier: 'data:image/png;base64,mock-image-data',
      },
    },
    min_variance: {
      optimal_weights: { AAPL: 0.3, GOOGL: 0.7 },
      expected_return: 0.10,
      risk: 0.12,
      visualizations: {
        efficient_frontier: 'data:image/png;base64,mock-image-data-2',
      },
    },
  },
};

const mockApiResponse = {
  data: {
    stocks_list: mockPortfolioData,
    portfolio_data: mockPortfolioResults,
  },
};

describe('Portfolio Component', () => {
  const mockSetPortfolio = jest.fn();
  const mockSetPortfolioResults = jest.fn();

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue(mockApiResponse);
    mockSetPortfolio.mockClear();
    mockSetPortfolioResults.mockClear();
  });

  describe('Component Rendering', () => {
    test('renders portfolio title and basic structure', async () => {
      render(
        <Portfolio
          portfolio={[]}
          setPortfolio={mockSetPortfolio}
          portfolioResults={null}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('My Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Basic')).toBeInTheDocument();
      expect(screen.getByText('Risk Management')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Optimization')).toBeInTheDocument();
    });

    test('renders sub-tabs in Basic section', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('Trades')).toBeInTheDocument();
      expect(screen.getByText('Pie Chart')).toBeInTheDocument();
      expect(screen.getByText('Line Chart')).toBeInTheDocument();
      expect(screen.getByText('Total Portfolio')).toBeInTheDocument();
    });

    test('renders risk management sub-tabs', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('VaR Comparison')).toBeInTheDocument();
      expect(screen.getByText('Monte Carlo Simulated Returns')).toBeInTheDocument();
      expect(screen.getByText('Risk-Reward Metrics')).toBeInTheDocument();
      expect(screen.getByText('Rolling Volatility')).toBeInTheDocument();
    });

    test('renders optimization tabs', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('1. Sharpe Ratio')).toBeInTheDocument();
      expect(screen.getByText('2. Mean Variance')).toBeInTheDocument();
      expect(screen.getByText('3. Max Return')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    test('fetches portfolio data on component mount', async () => {
      render(
        <Portfolio
          portfolio={[]}
          setPortfolio={mockSetPortfolio}
          portfolioResults={null}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://localhost:5000/api/portfolio',
          { withCredentials: true }
        );
      });

      expect(mockSetPortfolio).toHaveBeenCalledWith(mockPortfolioData);
      expect(mockSetPortfolioResults).toHaveBeenCalledWith(mockPortfolioResults);
    });

    test('handles API error during data fetch', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      render(
        <Portfolio
          portfolio={[]}
          setPortfolio={mockSetPortfolio}
          portfolioResults={null}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Error fetching portfolio')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    test('uses correct backend URL from environment', async () => {
      process.env.REACT_APP_BACKEND_URL = 'http://test-backend:3000';

      render(
        <Portfolio
          portfolio={[]}
          setPortfolio={mockSetPortfolio}
          portfolioResults={null}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          'http://test-backend:3000/api/portfolio',
          { withCredentials: true }
        );
      });
    });
  });

  describe('Portfolio Trades Table', () => {
    test('renders trades table with portfolio data', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('AAPL')).toBeInTheDocument();
      expect(screen.getByText('GOOGL')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('2500')).toBeInTheDocument();
    });

    test('renders table headers correctly', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('Stock Symbol')).toBeInTheDocument();
      expect(screen.getByText('Quantity')).toBeInTheDocument();
      expect(screen.getByText('Purchase Price')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    test('formats dates correctly in table', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      // Dates should be formatted as localeDate
      const expectedDate1 = new Date('2023-01-01').toLocaleDateString();
      const expectedDate2 = new Date('2023-02-01').toLocaleDateString();
      
      expect(screen.getByText(expectedDate1)).toBeInTheDocument();
      expect(screen.getByText(expectedDate2)).toBeInTheDocument();
    });
  });

  describe('CRUD Operations', () => {
    test('enters edit mode when Edit button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10')).toBeInTheDocument(); // Quantity input
      expect(screen.getByDisplayValue('150')).toBeInTheDocument(); // Price input
    });

    test('cancels edit mode when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);
      
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(screen.queryByText('Save')).not.toBeInTheDocument();
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    test('updates stock data when Save button is clicked', async () => {
      const user = userEvent.setup();
      mockedAxios.put.mockResolvedValue({ status: 200 });
      mockedAxios.get.mockResolvedValue(mockApiResponse);
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      const quantityInput = screen.getByDisplayValue('10');
      await user.clear(quantityInput);
      await user.type(quantityInput, '15');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockedAxios.put).toHaveBeenCalledWith(
          'http://localhost:5000/api/portfolio/update/1',
          {
            quantity: '15',
            purchase_price: '150',
            date: '2023-01-01',
          },
          { withCredentials: true }
        );
      });

      expect(screen.getByText('Stock updated in portfolio')).toBeInTheDocument();
    });

    test('handles update error correctly', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.put.mockRejectedValue(new Error('Update failed'));
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Error updating stock in portfolio')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    test('deletes stock when Delete button is clicked', async () => {
      const user = userEvent.setup();
      mockedAxios.delete.mockResolvedValue({ status: 200 });
      mockedAxios.get.mockResolvedValue(mockApiResponse);
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(mockedAxios.delete).toHaveBeenCalledWith(
          'http://localhost:5000/api/portfolio/delete/1',
          { withCredentials: true }
        );
      });

      expect(screen.getByText('Stock removed from portfolio')).toBeInTheDocument();
    });

    test('handles delete error correctly', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.delete.mockRejectedValue(new Error('Delete failed'));
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      const deleteButtons = screen.getAllByText('Delete');
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Error removing stock from portfolio')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Chart Data Processing', () => {
    test('processes pie chart data correctly', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      expect(screen.getByText('AAPL: 1600')).toBeInTheDocument();
      expect(screen.getByText('GOOGL: 12500')).toBeInTheDocument();
    });

    test('handles missing pie chart data gracefully', () => {
      const emptyResults = { ...mockPortfolioResults };
      delete emptyResults.portfolio_stock_names;
      delete emptyResults.portfolio_current_value;

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={emptyResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Pie chart data is not in the expected format or is empty.'
      );
      
      consoleWarnSpy.mockRestore();
    });

    test('processes line chart data correctly', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      expect(screen.getByText('{"date":"2023-01-01","value":14100}')).toBeInTheDocument();
      expect(screen.getByText('{"date":"2023-01-02","value":14250}')).toBeInTheDocument();
    });

    test('handles missing line chart data gracefully', () => {
      const emptyResults = { ...mockPortfolioResults };
      delete emptyResults.dates;
      delete emptyResults.prices;

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={emptyResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Line chart data is not in the expected format or is empty.'
      );
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Risk Metrics', () => {
    test('renders VaR comparison chart', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('VaR Comparison')).toBeInTheDocument();
      expect(screen.getByText('{"name":"Historical VaR","value":-500}')).toBeInTheDocument();
      expect(screen.getByText('{"name":"Monte Carlo VaR","value":-450}')).toBeInTheDocument();
    });

    test('renders Monte Carlo simulation data', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('Monte Carlo Simulated Returns')).toBeInTheDocument();
      expect(screen.getByText('{"return":0.1}')).toBeInTheDocument();
      expect(screen.getByText('{"return":-0.02}')).toBeInTheDocument();
    });

    test('renders risk-reward metrics', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('Risk-Reward Metrics')).toBeInTheDocument();
      expect(screen.getByText('{"name":"Sharpe Ratio","value":1.2}')).toBeInTheDocument();
      expect(screen.getByText('{"name":"Sortino Ratio","value":1.5}')).toBeInTheDocument();
    });

    test('handles missing risk metrics gracefully', () => {
      const noRiskMetrics = { ...mockPortfolioResults };
      delete noRiskMetrics.risk_metrics;
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={noRiskMetrics}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      // Should not crash and should still render other components
      expect(screen.getByText('My Portfolio')).toBeInTheDocument();
    });
  });

  describe('Portfolio Optimization', () => {
    test('renders optimization charts for available strategies', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('Optimal Allocation')).toBeInTheDocument();
      expect(screen.getByText('Portfolio Metrics')).toBeInTheDocument();
      expect(screen.getByText('Expected Return')).toBeInTheDocument();
      expect(screen.getByText('Risk (Std Dev)')).toBeInTheDocument();
    });

    test('displays optimization metrics correctly', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('12.00%')).toBeInTheDocument(); // Expected return
      expect(screen.getByText('15.00%')).toBeInTheDocument(); // Risk
    });

    test('renders efficient frontier images when available', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      const images = screen.getAllByAltText(/Efficient Frontier/);
      expect(images.length).toBeGreaterThan(0);
      expect(images[0]).toHaveAttribute('src', 'data:image/png;base64,mock-image-data');
    });

    test('handles missing optimization data', () => {
      const noOptimizations = { ...mockPortfolioResults };
      delete noOptimizations.optimizations;
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={noOptimizations}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('No optimization data available for 1. Sharpe Ratio.')).toBeInTheDocument();
    });
  });

  describe('Total Portfolio Table', () => {
    test('renders consolidated portfolio data', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('Total Portfolio')).toBeInTheDocument();
      expect(screen.getByText('Company')).toBeInTheDocument();
      expect(screen.getByText('Current Amount')).toBeInTheDocument();
    });

    test('handles empty portfolio data', () => {
      const emptyPortfolioResults = { ...mockPortfolioResults };
      emptyPortfolioResults.portfolio_consolidated = [];
      
      render(
        <Portfolio
          portfolio={[]}
          setPortfolio={mockSetPortfolio}
          portfolioResults={emptyPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByText('No portfolio data available. Add trades to your portfolio to see data here.')).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    test('validates numeric inputs in edit mode', async () => {
      const user = userEvent.setup();
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      const quantityInput = screen.getByDisplayValue('10');
      expect(quantityInput).toHaveAttribute('type', 'number');

      const priceInput = screen.getByDisplayValue('150');
      expect(priceInput).toHaveAttribute('type', 'number');
    });

    test('validates date inputs in edit mode', async () => {
      const user = userEvent.setup();
      
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      const editButtons = screen.getAllByText('Edit');
      await user.click(editButtons[0]);

      const dateInput = screen.getByDisplayValue('2023-01-01');
      expect(dateInput).toHaveAttribute('type', 'date');
    });
  });

  describe('Error Handling', () => {
    test('displays error message when API calls fail', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(new Error('API Error'));
      
      render(
        <Portfolio
          portfolio={[]}
          setPortfolio={mockSetPortfolio}
          portfolioResults={null}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Error fetching portfolio')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });

    test('handles network errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      
      render(
        <Portfolio
          portfolio={[]}
          setPortfolio={mockSetPortfolio}
          portfolioResults={null}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Error fetching portfolio')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Chart Accessibility', () => {
    test('charts have proper accessibility attributes', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      const pieChart = screen.getByTestId('pie-chart');
      expect(pieChart).toHaveAttribute('data-width', '600');
      expect(pieChart).toHaveAttribute('data-height', '300');

      const lineChart = screen.getByTestId('line-chart');
      expect(lineChart).toHaveAttribute('data-width', '750');
      expect(lineChart).toHaveAttribute('data-height', '450');
    });

    test('chart components render with proper test ids', () => {
      render(
        <Portfolio
          portfolio={mockPortfolioData}
          setPortfolio={mockSetPortfolio}
          portfolioResults={mockPortfolioResults}
          setPortfolioResults={mockSetPortfolioResults}
        />
      );

      expect(screen.getByTestId('pie')).toBeInTheDocument();
      expect(screen.getByTestId('line')).toBeInTheDocument();
      expect(screen.getByTestId('tooltip')).toBeInTheDocument();
      expect(screen.getByTestId('legend')).toBeInTheDocument();
    });
  });
});
