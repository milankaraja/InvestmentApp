import React, { useContext } from 'react';
import { UserContext } from './UserContext';

const UserInfo = () => {
  const { user } = useContext(UserContext);

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

export default UserInfo;