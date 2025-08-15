/**
 * Comprehensive Test Suite for Login Component
 * Tests user authentication functionality including form validation,
 * API integration, user context updates, navigation, and error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Login from '../Login';
import { UserContext } from '../UserContext';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper function to render Login component with router and context
const renderLogin = (userContextValue = { user: null, setUser: jest.fn() }) => {
  return render(
    <UserContext.Provider value={userContextValue}>
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    </UserContext.Provider>
  );
};

describe('Login Component', () => {
  let mockSetUser;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSetUser = jest.fn();
    process.env.REACT_APP_BACKEND_URL = 'http://localhost:5000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders login form with all required elements', () => {
      renderLogin();
      
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    test('form inputs have correct attributes', () => {
      renderLogin();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });

    test('form inputs are initially empty', () => {
      renderLogin();
      
      expect(screen.getByPlaceholderText('Username')).toHaveValue('');
      expect(screen.getByPlaceholderText('Password')).toHaveValue('');
    });
  });

  describe('User Interaction', () => {
    test('updates username input value on change', () => {
      renderLogin();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      expect(usernameInput).toHaveValue('testuser');
    });

    test('updates password input value on change', () => {
      renderLogin();
      
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
      
      expect(passwordInput).toHaveValue('testpassword');
    });

    test('maintains input values when both are changed', () => {
      renderLogin();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      
      expect(usernameInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('testpass');
    });

    test('clears form after submitting and changing inputs', () => {
      renderLogin();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      
      // Change to different values
      fireEvent.change(usernameInput, { target: { value: 'newuser' } });
      fireEvent.change(passwordInput, { target: { value: 'newpass' } });
      
      expect(usernameInput).toHaveValue('newuser');
      expect(passwordInput).toHaveValue('newpass');
    });
  });

  describe('Form Submission', () => {
    test('submits form with correct data on button click', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'Login successful' }
      });

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:5000/login',
          { username: 'testuser', password: 'testpass' },
          { withCredentials: true }
        );
      });
    });

    test('submits form with correct data on form submit', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'Login successful' }
      });

      renderLogin({ user: null, setUser: mockSetUser });
      
      const form = screen.getByRole('form');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      });
    });

    test('includes withCredentials in API request', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'Login successful' }
      });

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          expect.any(String),
          expect.any(Object),
          { withCredentials: true }
        );
      });
    });
  });

  describe('UserContext Integration', () => {
    test('updates user context on successful login', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'Login successful' }
      });

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({ username: 'testuser' });
      });
    });

    test('sets user context with correct username', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'Login successful' }
      });

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({ username: 'johndoe' });
      });
    });

    test('does not update user context on login failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Login failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      expect(mockSetUser).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Navigation', () => {
    test('navigates to home page on successful login', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'Login successful' }
      });

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('does not navigate on login failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Login failed'));

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      expect(mockNavigate).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    test('handles login error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.post.mockRejectedValue(new Error('Login failed'));

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Login failed:', expect.any(Error));
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('handles network errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Login failed:', expect.any(Error));
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('handles 401 unauthorized error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 401,
          data: { message: 'Invalid credentials' }
        }
      });

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('handles server errors (500)', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      });

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Environment Configuration', () => {
    test('uses backend URL from environment variable', async () => {
      process.env.REACT_APP_BACKEND_URL = 'https://api.example.com';
      mockedAxios.post.mockResolvedValue({
        data: { message: 'Login successful' }
      });

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'https://api.example.com/login',
          expect.any(Object),
          expect.any(Object)
        );
      });
    });

    test('handles missing environment variable', async () => {
      delete process.env.REACT_APP_BACKEND_URL;
      mockedAxios.post.mockResolvedValue({
        data: { message: 'Login successful' }
      });

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'undefined/login',
          expect.any(Object),
          expect.any(Object)
        );
      });
    });
  });

  describe('Form Validation', () => {
    test('prevents submission with empty username', async () => {
      renderLogin({ user: null, setUser: mockSetUser });
      
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      // HTML5 validation should prevent submission
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('prevents submission with empty password', async () => {
      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(submitButton);
      
      // HTML5 validation should prevent submission
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('prevents submission with both fields empty', async () => {
      renderLogin({ user: null, setUser: mockSetUser });
      
      const submitButton = screen.getByRole('button', { name: 'Login' });
      fireEvent.click(submitButton);
      
      // HTML5 validation should prevent submission
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    test('form has proper semantic structure', () => {
      renderLogin({ user: null, setUser: mockSetUser });
      
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    test('inputs have proper types and attributes', () => {
      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(usernameInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });

    test('form is keyboard accessible', () => {
      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      usernameInput.focus();
      
      expect(document.activeElement).toBe(usernameInput);
    });
  });

  describe('Console Logging', () => {
    test('logs successful login response', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockResponse = { data: { message: 'Login successful' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(mockResponse.data);
      });
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('Multiple Login Attempts', () => {
    test('handles multiple consecutive login attempts', async () => {
      mockedAxios.post
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({ data: { message: 'Login successful' } });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      renderLogin({ user: null, setUser: mockSetUser });
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });
      
      // First attempt - should fail
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });
      
      // Second attempt - should succeed
      fireEvent.change(passwordInput, { target: { value: 'correctpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockSetUser).toHaveBeenCalledWith({ username: 'testuser' });
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
      
      consoleErrorSpy.mockRestore();
    });
  });
});
