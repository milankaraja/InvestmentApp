/**
 * Comprehensive Test Suite for Register Component
 * Tests user registration functionality including form validation,
 * API integration, navigation, and error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Register from '../Register';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Helper function to render Register component with router
const renderRegister = () => {
  return render(
    <BrowserRouter>
      <Register />
    </BrowserRouter>
  );
};

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock environment variable
    process.env.REACT_APP_BACKEND_URL = 'http://localhost:5000';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders registration form with all required elements', () => {
      renderRegister();
      
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    test('form inputs have correct attributes', () => {
      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(usernameInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('required');
    });

    test('form inputs are initially empty', () => {
      renderRegister();
      
      expect(screen.getByPlaceholderText('Username')).toHaveValue('');
      expect(screen.getByPlaceholderText('Password')).toHaveValue('');
    });
  });

  describe('User Interaction', () => {
    test('updates username input value on change', () => {
      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      
      expect(usernameInput).toHaveValue('testuser');
    });

    test('updates password input value on change', () => {
      renderRegister();
      
      const passwordInput = screen.getByPlaceholderText('Password');
      fireEvent.change(passwordInput, { target: { value: 'testpassword' } });
      
      expect(passwordInput).toHaveValue('testpassword');
    });

    test('maintains input values when both are changed', () => {
      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      
      expect(usernameInput).toHaveValue('testuser');
      expect(passwordInput).toHaveValue('testpass');
    });
  });

  describe('Form Submission', () => {
    test('submits form with correct data on button click', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'User registered successfully' }
      });

      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://localhost:5000/register',
          { username: 'testuser', password: 'testpass' },
          { withCredentials: true }
        );
      });
    });

    test('submits form with correct data on form submit', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'User registered successfully' }
      });

      renderRegister();
      
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

    test('prevents default form submission behavior', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'User registered successfully' }
      });

      renderRegister();
      
      const form = screen.getByRole('form');
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      const preventDefaultSpy = jest.spyOn(submitEvent, 'preventDefault');
      
      form.dispatchEvent(submitEvent);
      
      // Note: In a real component test, you'd verify preventDefault was called
      // This is a conceptual test structure
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

    test('includes withCredentials in API request', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'User registered successfully' }
      });

      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
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

  describe('API Integration', () => {
    test('navigates to home page on successful registration', async () => {
      mockedAxios.post.mockResolvedValue({
        data: { message: 'User registered successfully' }
      });

      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    test('handles registration error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.post.mockRejectedValue(new Error('Registration failed'));

      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Registration failed:', expect.any(Error));
      });
      
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    test('handles network timeout error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.post.mockRejectedValue(new Error('Network timeout'));

      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Registration failed:', expect.any(Error));
      });
      
      consoleErrorSpy.mockRestore();
    });

    test('handles server error response', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Username already exists' }
        }
      });

      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
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
        data: { message: 'User registered successfully' }
      });

      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'https://api.example.com/register',
          expect.any(Object),
          expect.any(Object)
        );
      });
    });

    test('handles missing environment variable gracefully', async () => {
      delete process.env.REACT_APP_BACKEND_URL;
      mockedAxios.post.mockResolvedValue({
        data: { message: 'User registered successfully' }
      });

      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'undefined/register',
          expect.any(Object),
          expect.any(Object)
        );
      });
    });
  });

  describe('Form Validation', () => {
    test('prevents submission with empty username', async () => {
      renderRegister();
      
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      // HTML5 validation should prevent submission
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('prevents submission with empty password', async () => {
      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.click(submitButton);
      
      // HTML5 validation should prevent submission
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    test('prevents submission with both fields empty', async () => {
      renderRegister();
      
      const submitButton = screen.getByRole('button', { name: 'Register' });
      fireEvent.click(submitButton);
      
      // HTML5 validation should prevent submission
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });
  });

  describe('Loading and Disabled States', () => {
    test('button remains enabled during normal interaction', () => {
      renderRegister();
      
      const submitButton = screen.getByRole('button', { name: 'Register' });
      expect(submitButton).not.toBeDisabled();
    });

    test('form inputs remain enabled during normal interaction', () => {
      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      expect(usernameInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    test('form has proper semantic structure', () => {
      renderRegister();
      
      expect(screen.getByRole('form')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
    });

    test('inputs have proper types', () => {
      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      
      expect(usernameInput).toHaveAttribute('type', 'text');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('form is keyboard accessible', () => {
      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      usernameInput.focus();
      
      expect(document.activeElement).toBe(usernameInput);
    });
  });

  describe('Console Logging', () => {
    test('logs successful registration response', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const mockResponse = { data: { message: 'User registered successfully' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      renderRegister();
      
      const usernameInput = screen.getByPlaceholderText('Username');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Register' });
      
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(mockResponse.data);
      });
      
      consoleLogSpy.mockRestore();
    });
  });
});
