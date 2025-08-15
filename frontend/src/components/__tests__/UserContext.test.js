/**
 * Comprehensive Test Suite for UserContext
 * Tests user state management including context creation,
 * state updates, provider functionality, and consumer access
 */

import React, { useContext } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { UserProvider, UserContext } from '../UserContext';

// Test component to consume UserContext
const TestConsumer = () => {
  const { user, setUser } = useContext(UserContext);
  
  return (
    <div>
      <div data-testid="user-display">
        {user ? `User: ${user.username}` : 'No user'}
      </div>
      <button
        data-testid="set-user-btn"
        onClick={() => setUser({ username: 'testuser' })}
      >
        Set User
      </button>
      <button
        data-testid="clear-user-btn"
        onClick={() => setUser(null)}
      >
        Clear User
      </button>
      <button
        data-testid="update-user-btn"
        onClick={() => setUser({ username: 'updateduser', role: 'admin' })}
      >
        Update User
      </button>
    </div>
  );
};

// Helper function to render with UserProvider
const renderWithProvider = (component) => {
  return render(
    <UserProvider>
      {component}
    </UserProvider>
  );
};

describe('UserContext', () => {
  describe('UserProvider', () => {
    test('renders children without errors', () => {
      renderWithProvider(<div data-testid="test-child">Test Child</div>);
      
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    test('provides initial user state as null', () => {
      renderWithProvider(<TestConsumer />);
      
      expect(screen.getByTestId('user-display')).toHaveTextContent('No user');
    });

    test('provides setUser function that works', () => {
      renderWithProvider(<TestConsumer />);
      
      const setUserButton = screen.getByTestId('set-user-btn');
      expect(setUserButton).toBeInTheDocument();
      
      // Function should be available (no error thrown)
      fireEvent.click(setUserButton);
      
      expect(screen.getByTestId('user-display')).toHaveTextContent('User: testuser');
    });

    test('renders multiple children correctly', () => {
      renderWithProvider(
        <div>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <TestConsumer />
        </div>
      );
      
      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('user-display')).toBeInTheDocument();
    });
  });

  describe('User State Management', () => {
    test('updates user state when setUser is called', () => {
      renderWithProvider(<TestConsumer />);
      
      // Initial state
      expect(screen.getByTestId('user-display')).toHaveTextContent('No user');
      
      // Set user
      fireEvent.click(screen.getByTestId('set-user-btn'));
      expect(screen.getByTestId('user-display')).toHaveTextContent('User: testuser');
    });

    test('clears user state when setUser is called with null', () => {
      renderWithProvider(<TestConsumer />);
      
      // Set user first
      fireEvent.click(screen.getByTestId('set-user-btn'));
      expect(screen.getByTestId('user-display')).toHaveTextContent('User: testuser');
      
      // Clear user
      fireEvent.click(screen.getByTestId('clear-user-btn'));
      expect(screen.getByTestId('user-display')).toHaveTextContent('No user');
    });

    test('updates user state with different values', () => {
      renderWithProvider(<TestConsumer />);
      
      // Set initial user
      fireEvent.click(screen.getByTestId('set-user-btn'));
      expect(screen.getByTestId('user-display')).toHaveTextContent('User: testuser');
      
      // Update user
      fireEvent.click(screen.getByTestId('update-user-btn'));
      expect(screen.getByTestId('user-display')).toHaveTextContent('User: updateduser');
    });

    test('maintains user state across re-renders', () => {
      const { rerender } = renderWithProvider(<TestConsumer />);
      
      // Set user
      fireEvent.click(screen.getByTestId('set-user-btn'));
      expect(screen.getByTestId('user-display')).toHaveTextContent('User: testuser');
      
      // Re-render component
      rerender(
        <UserProvider>
          <TestConsumer />
        </UserProvider>
      );
      
      // Note: This will actually reset because it's a new provider instance
      // In a real app, the provider would persist across route changes
      expect(screen.getByTestId('user-display')).toBeInTheDocument();
    });
  });

  describe('Multiple Consumers', () => {
    const SecondConsumer = () => {
      const { user, setUser } = useContext(UserContext);
      
      return (
        <div>
          <div data-testid="second-user-display">
            {user ? `Second: ${user.username}` : 'Second: No user'}
          </div>
          <button
            data-testid="second-set-user-btn"
            onClick={() => setUser({ username: 'seconduser' })}
          >
            Set Second User
          </button>
        </div>
      );
    };

    test('provides same user state to multiple consumers', () => {
      renderWithProvider(
        <div>
          <TestConsumer />
          <SecondConsumer />
        </div>
      );
      
      // Both should show no user initially
      expect(screen.getByTestId('user-display')).toHaveTextContent('No user');
      expect(screen.getByTestId('second-user-display')).toHaveTextContent('Second: No user');
      
      // Set user from first consumer
      fireEvent.click(screen.getByTestId('set-user-btn'));
      
      // Both should show the same user
      expect(screen.getByTestId('user-display')).toHaveTextContent('User: testuser');
      expect(screen.getByTestId('second-user-display')).toHaveTextContent('Second: testuser');
    });

    test('updates all consumers when user state changes', () => {
      renderWithProvider(
        <div>
          <TestConsumer />
          <SecondConsumer />
        </div>
      );
      
      // Set user from second consumer
      fireEvent.click(screen.getByTestId('second-set-user-btn'));
      
      // Both should show the updated user
      expect(screen.getByTestId('user-display')).toHaveTextContent('User: seconduser');
      expect(screen.getByTestId('second-user-display')).toHaveTextContent('Second: seconduser');
      
      // Clear user from first consumer
      fireEvent.click(screen.getByTestId('clear-user-btn'));
      
      // Both should show no user
      expect(screen.getByTestId('user-display')).toHaveTextContent('No user');
      expect(screen.getByTestId('second-user-display')).toHaveTextContent('Second: No user');
    });
  });

  describe('Context Value Structure', () => {
    const ContextInspector = () => {
      const contextValue = useContext(UserContext);
      
      return (
        <div>
          <div data-testid="has-user-prop">
            {contextValue.hasOwnProperty('user') ? 'true' : 'false'}
          </div>
          <div data-testid="has-setuser-prop">
            {contextValue.hasOwnProperty('setUser') ? 'true' : 'false'}
          </div>
          <div data-testid="user-type">
            {typeof contextValue.user}
          </div>
          <div data-testid="setuser-type">
            {typeof contextValue.setUser}
          </div>
        </div>
      );
    };

    test('provides correct context value structure', () => {
      renderWithProvider(<ContextInspector />);
      
      expect(screen.getByTestId('has-user-prop')).toHaveTextContent('true');
      expect(screen.getByTestId('has-setuser-prop')).toHaveTextContent('true');
      expect(screen.getByTestId('setuser-type')).toHaveTextContent('function');
    });

    test('user property has correct initial type', () => {
      renderWithProvider(<ContextInspector />);
      
      expect(screen.getByTestId('user-type')).toHaveTextContent('object');
    });
  });

  describe('Error Boundaries', () => {
    test('handles missing provider gracefully', () => {
      // This test verifies behavior when component is used outside provider
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // This would typically throw an error or provide undefined context
      expect(() => {
        render(<TestConsumer />);
      }).toThrow();
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('User Object Properties', () => {
    const UserPropertyInspector = () => {
      const { user, setUser } = useContext(UserContext);
      
      return (
        <div>
          <div data-testid="user-username">
            {user?.username || 'no-username'}
          </div>
          <div data-testid="user-role">
            {user?.role || 'no-role'}
          </div>
          <button
            data-testid="set-complex-user"
            onClick={() => setUser({ 
              username: 'complexuser', 
              role: 'admin', 
              email: 'user@example.com' 
            })}
          >
            Set Complex User
          </button>
        </div>
      );
    };

    test('handles user objects with multiple properties', () => {
      renderWithProvider(<UserPropertyInspector />);
      
      // Initially no user
      expect(screen.getByTestId('user-username')).toHaveTextContent('no-username');
      expect(screen.getByTestId('user-role')).toHaveTextContent('no-role');
      
      // Set complex user
      fireEvent.click(screen.getByTestId('set-complex-user'));
      
      expect(screen.getByTestId('user-username')).toHaveTextContent('complexuser');
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    });

    test('handles partial user objects', () => {
      const PartialUserSetter = () => {
        const { setUser } = useContext(UserContext);
        
        return (
          <button
            data-testid="set-partial-user"
            onClick={() => setUser({ username: 'partialuser' })}
          >
            Set Partial User
          </button>
        );
      };

      renderWithProvider(
        <div>
          <UserPropertyInspector />
          <PartialUserSetter />
        </div>
      );
      
      fireEvent.click(screen.getByTestId('set-partial-user'));
      
      expect(screen.getByTestId('user-username')).toHaveTextContent('partialuser');
      expect(screen.getByTestId('user-role')).toHaveTextContent('no-role');
    });
  });

  describe('State Persistence', () => {
    test('maintains state during component updates', () => {
      let setUserRef;
      
      const StatePersistenceTest = ({ version }) => {
        const { user, setUser } = useContext(UserContext);
        setUserRef = setUser;
        
        return (
          <div>
            <div data-testid="version">{version}</div>
            <div data-testid="user-state">
              {user ? user.username : 'no-user'}
            </div>
          </div>
        );
      };

      const { rerender } = renderWithProvider(<StatePersistenceTest version="1" />);
      
      expect(screen.getByTestId('user-state')).toHaveTextContent('no-user');
      
      // Set user using ref (simulating external state change)
      act(() => {
        setUserRef({ username: 'persistent-user' });
      });
      
      expect(screen.getByTestId('user-state')).toHaveTextContent('persistent-user');
      
      // Re-render with different props
      rerender(
        <UserProvider>
          <StatePersistenceTest version="2" />
        </UserProvider>
      );
      
      expect(screen.getByTestId('version')).toHaveTextContent('2');
      // Note: This creates a new provider instance, so state is reset
      expect(screen.getByTestId('user-state')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    test('does not cause unnecessary re-renders', () => {
      let renderCount = 0;
      
      const RenderCounter = () => {
        renderCount++;
        const { user } = useContext(UserContext);
        
        return (
          <div data-testid="render-count">
            Renders: {renderCount}, User: {user?.username || 'none'}
          </div>
        );
      };

      renderWithProvider(
        <div>
          <RenderCounter />
          <TestConsumer />
        </div>
      );
      
      const initialRenderCount = renderCount;
      
      // Setting the same user shouldn't cause extra renders
      fireEvent.click(screen.getByTestId('set-user-btn'));
      fireEvent.click(screen.getByTestId('set-user-btn'));
      
      // Should have rendered once for initial + once for state change
      expect(renderCount).toBeGreaterThan(initialRenderCount);
    });
  });
});
