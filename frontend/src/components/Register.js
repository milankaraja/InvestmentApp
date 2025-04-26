import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL; 
      const response = await axios.post(`${backendUrl}/register`,{ username, password }, { withCredentials: true });
      //const response = await axios.post('https://c50d-117-206-252-168.ngrok-free.app/register', { username, password });
      console.log(response.data);
      navigate('/');
      // Redirect or update state for registration
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div>
        <form onSubmit={handleRegister}>
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
          <button type="submit">Register</button>
        </form>

    </div>

  );
}

export default Register;