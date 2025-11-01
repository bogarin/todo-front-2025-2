import React from 'react';
import { useAuth } from '../hooks/useAuth';

const LogoutButton: React.FC = () => {
  const { logout, user } = useAuth();

  return (
    <button
      onClick={() => logout()}
      className="px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-700"
      title={user && typeof user.preferred_username === 'string' ? user.preferred_username : 'Logout'}
    >
      Logout
    </button>
  );
};

export default LogoutButton;