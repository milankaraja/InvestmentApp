import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CurrentUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL; 
      const response = await axios.get(`${backendUrl}/current_user`, { withCredentials: true });
        //const response = await axios.get('https://c50d-117-206-252-168.ngrok-free.app/current_user', { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <div>
      {user ? (
        <p>Logged in as: {user.username}</p>
      ) : (
        <p>No user logged in</p>
      )}
    </div>
  );
};

export default CurrentUser;