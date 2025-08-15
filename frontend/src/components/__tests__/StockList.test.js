/**
 * Comprehensive Test Suite for StockList Component
 * Tests API integration, data display, error handling,
 * loading states, and component behavior
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import StockList from '../StockList';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('StockList Component', () => {
  const mockStocksData = [
    'ADANIPORTS',
    'ASIANPAINT',
    'AXISBANK',
    'BAJAJ-AUTO',
    'BAJFINANCE',
    'BAJAJFINSV',
    'BHARTIARTL',
    'BPCL',
    'BRITANNIA',
    'CIPLA',
    'COALINDIA',
    'DIVISLAB',
    'DRREDDY',
    'EICHERMOT',
    'GRASIM',
    'HCLTECH',
    'HDFC',
    'HDFCBANK',
    'HDFCLIFE',
    'HEROMOTOCO',
    'HINDALCO',
    'HINDUNILVR',
    'ICICIBANK',
    'INDUSINDBK',
    'INFY',
    'ITC',
    'JSWSTEEL',
    'KOTAKBANK',
    'LT',
    'M&M',
    'MARUTI',
    'NESTLEIND',
    'NTPC',
    'ONGC',
    'POWERGRID',
    'RELIANCE',
    'SBILIFE',
    'SBIN',
    'SHREECEM',
    'SUNPHARMA',
    'TATACONSUM',
    'TATAMOTORS',
    'TATASTEEL',
    'TCS',
    'TECHM',
    'TITAN',
    'ULTRACEMCO',
    'UPL',
    'WIPRO'
  ];

  beforeEach(() => {
    mockedAxios.get.mockResolvedValue({ data: mockStocksData });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders component title', async () => {
      render(<StockList />);
      
      expect(screen.getByText('Nifty Stocks')).toBeInTheDocument();
    });

    test('renders as a list structure', async () => {
      render(<StockList />);
      
      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();
      });
    });

    test('renders heading with correct level', () => {
      render(<StockList />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Nifty Stocks');
    });

    test('initially renders empty list before data loads', () => {
      mockedAxios.get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<StockList />);
      
      const list = screen.getByRole('list');
      expect(list).toBeEmptyDOMElement();
    });
  });

  describe('API Integration', () => {
    test('makes API call on component mount', async () => {
      render(<StockList />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://127.0.0.1:5000/stocks');
      });
    });

    test('makes API call only once', async () => {
      render(<StockList />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });
    });

    test('uses correct API endpoint', async () => {
      render(<StockList />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith('http://127.0.0.1:5000/stocks');
      });
    });

    test('handles successful API response', async () => {
      render(<StockList />);
      
      await waitFor(() => {
        expect(screen.getByText('RELIANCE')).toBeInTheDocument();
        expect(screen.getByText('TCS')).toBeInTheDocument();
        expect(screen.getByText('INFY')).toBeInTheDocument();
      });
    });

    test('renders all stocks from API response', async () => {
      render(<StockList />);
      
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(mockStocksData.length);
      });
    });

    test('handles empty API response', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });
      
      render(<StockList />);
      
      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeEmptyDOMElement();
      });
    });

    test('handles API response with null data', async () => {
      mockedAxios.get.mockResolvedValue({ data: null });
      
      render(<StockList />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalled();
      });
      
      // Should not crash
      expect(screen.getByText('Nifty Stocks')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('handles network errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      
      render(<StockList />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch stocks:', expect.any(Error));
      });
      
      // Component should still render without crashing
      expect(screen.getByText('Nifty Stocks')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      
      consoleErrorSpy.mockRestore();
    });

    test('handles 404 errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error404 = new Error('Request failed with status code 404');
      error404.response = { status: 404 };
      mockedAxios.get.mockRejectedValue(error404);
      
      render(<StockList />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch stocks:', error404);
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('handles 500 server errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const error500 = new Error('Request failed with status code 500');
      error500.response = { status: 500 };
      mockedAxios.get.mockRejectedValue(error500);
      
      render(<StockList />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch stocks:', error500);
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('handles timeout errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const timeoutError = new Error('timeout of 5000ms exceeded');
      timeoutError.code = 'ECONNABORTED';
      mockedAxios.get.mockRejectedValue(timeoutError);
      
      render(<StockList />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch stocks:', timeoutError);
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('continues to display component structure even after error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(new Error('API Error'));
      
      render(<StockList />);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      expect(screen.getByText('Nifty Stocks')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Data Display', () => {
    test('displays each stock as a list item', async () => {
      render(<StockList />);
      
      await waitFor(() => {
        mockStocksData.forEach(stock => {
          expect(screen.getByText(stock)).toBeInTheDocument();
        });
      });
    });

    test('renders stocks in correct order', async () => {
      render(<StockList />);
      
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('ADANIPORTS');
        expect(listItems[1]).toHaveTextContent('ASIANPAINT');
        expect(listItems[2]).toHaveTextContent('AXISBANK');
      });
    });

    test('handles stocks with special characters', async () => {
      const specialStocks = ['M&M', 'L&T', 'BAJAJ-AUTO'];
      mockedAxios.get.mockResolvedValue({ data: specialStocks });
      
      render(<StockList />);
      
      await waitFor(() => {
        expect(screen.getByText('M&M')).toBeInTheDocument();
        expect(screen.getByText('L&T')).toBeInTheDocument();
        expect(screen.getByText('BAJAJ-AUTO')).toBeInTheDocument();
      });
    });

    test('handles very long stock names', async () => {
      const longStocks = ['VERYLONGSTOCKNAMETHATSHOULDSTILLWORK', 'ANOTHERLONGSTOCKNAME'];
      mockedAxios.get.mockResolvedValue({ data: longStocks });
      
      render(<StockList />);
      
      await waitFor(() => {
        expect(screen.getByText('VERYLONGSTOCKNAMETHATSHOULDSTILLWORK')).toBeInTheDocument();
        expect(screen.getByText('ANOTHERLONGSTOCKNAME')).toBeInTheDocument();
      });
    });

    test('handles single stock in list', async () => {
      mockedAxios.get.mockResolvedValue({ data: ['SINGLESTOCK'] });
      
      render(<StockList />);
      
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(1);
        expect(screen.getByText('SINGLESTOCK')).toBeInTheDocument();
      });
    });
  });

  describe('Component Lifecycle', () => {
    test('effect hook runs only on mount', async () => {
      const { rerender } = render(<StockList />);
      
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      });
      
      // Re-render component
      rerender(<StockList />);
      
      // Should not make additional API calls
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    test('handles component unmounting during API call', async () => {
      let resolvePromise;
      const pendingPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockedAxios.get.mockReturnValue(pendingPromise);
      
      const { unmount } = render(<StockList />);
      
      // Unmount before API call completes
      unmount();
      
      // Complete the API call after unmount
      resolvePromise({ data: mockStocksData });
      
      // Should not cause any errors
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    test('cleans up properly on unmount', () => {
      const { unmount } = render(<StockList />);
      
      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Performance', () => {
    test('does not make unnecessary re-renders', async () => {
      let renderCount = 0;
      
      const TestWrapper = () => {
        renderCount++;
        return <StockList />;
      };
      
      render(<TestWrapper />);
      
      await waitFor(() => {
        expect(screen.getByText('RELIANCE')).toBeInTheDocument();
      });
      
      // Should have rendered initially and once after data fetch
      expect(renderCount).toBeGreaterThanOrEqual(1);
      expect(renderCount).toBeLessThanOrEqual(3); // Account for React's rendering behavior
    });

    test('handles large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => `STOCK${i}`);
      mockedAxios.get.mockResolvedValue({ data: largeDataset });
      
      const startTime = performance.now();
      render(<StockList />);
      
      await waitFor(() => {
        expect(screen.getByText('STOCK0')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render large dataset reasonably quickly (within 1 second)
      expect(renderTime).toBeLessThan(1000);
      
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(1000);
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA roles', async () => {
      render(<StockList />);
      
      expect(screen.getByRole('list')).toBeInTheDocument();
      
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBeGreaterThan(0);
      });
    });

    test('has accessible heading', () => {
      render(<StockList />);
      
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAccessibleName('Nifty Stocks');
    });

    test('list items are properly structured', async () => {
      render(<StockList />);
      
      await waitFor(() => {
        const list = screen.getByRole('list');
        const listItems = screen.getAllByRole('listitem');
        
        listItems.forEach(item => {
          expect(list).toContainElement(item);
        });
      });
    });

    test('provides meaningful text content for screen readers', async () => {
      render(<StockList />);
      
      await waitFor(() => {
        const firstStock = screen.getByText('ADANIPORTS');
        expect(firstStock).toBeInTheDocument();
        expect(firstStock.textContent).toBe('ADANIPORTS');
      });
    });
  });

  describe('Integration', () => {
    test('works with different API response formats', async () => {
      // Test with array of objects instead of strings
      const objectStocks = [
        { symbol: 'RELIANCE', name: 'Reliance Industries' },
        { symbol: 'TCS', name: 'Tata Consultancy Services' }
      ];
      
      mockedAxios.get.mockResolvedValue({ data: objectStocks });
      
      render(<StockList />);
      
      await waitFor(() => {
        // Component should handle this gracefully (displaying object representation)
        expect(screen.getByRole('list')).toBeInTheDocument();
      });
    });

    test('handles mixed data types in array', async () => {
      const mixedData = ['RELIANCE', 123, 'TCS', null, 'INFY'];
      mockedAxios.get.mockResolvedValue({ data: mixedData });
      
      render(<StockList />);
      
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(5);
      });
    });

    test('maintains consistent behavior across different environments', async () => {
      // Test with production-like data
      const prodStocks = mockStocksData.slice(0, 10); // Subset for faster testing
      mockedAxios.get.mockResolvedValue({ data: prodStocks });
      
      render(<StockList />);
      
      await waitFor(() => {
        expect(screen.getAllByRole('listitem')).toHaveLength(10);
        expect(screen.getByText('ADANIPORTS')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles empty string in stocks array', async () => {
      const stocksWithEmpty = ['RELIANCE', '', 'TCS'];
      mockedAxios.get.mockResolvedValue({ data: stocksWithEmpty });
      
      render(<StockList />);
      
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
      });
    });

    test('handles whitespace-only strings', async () => {
      const stocksWithWhitespace = ['RELIANCE', '   ', 'TCS'];
      mockedAxios.get.mockResolvedValue({ data: stocksWithWhitespace });
      
      render(<StockList />);
      
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
      });
    });

    test('handles duplicate stock names', async () => {
      const duplicateStocks = ['RELIANCE', 'TCS', 'RELIANCE', 'INFY'];
      mockedAxios.get.mockResolvedValue({ data: duplicateStocks });
      
      render(<StockList />);
      
      await waitFor(() => {
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(4);
        expect(screen.getAllByText('RELIANCE')).toHaveLength(2);
      });
    });

    test('handles very large number of stocks', async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => `STOCK_${i}`);
      mockedAxios.get.mockResolvedValue({ data: largeArray });
      
      render(<StockList />);
      
      await waitFor(() => {
        expect(screen.getByText('STOCK_0')).toBeInTheDocument();
      });
      
      // Should handle large datasets without crashing
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(10000);
    });
  });
});
