import React, { useState, useContext} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext'; // Import UserContext

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate
  const { setUser } = useContext(UserContext); // Use UserContext

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL; 
      const response = await axios.post(`${backendUrl}/login`,{ username, password }, { withCredentials: true });
      //const response = await axios.post('https://c50d-117-206-252-168.ngrok-free.app/login', { username, password }, { withCredentials: true });
      
      // https://c50d-117-206-252-168.ngrok-free.app/
      console.log(response.data);
      setUser({ username }); // Store user information in context
      navigate('/');
      // Redirect or update state for login 
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;