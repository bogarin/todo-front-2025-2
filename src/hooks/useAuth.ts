import { useContext } from 'react';
import type { AuthContextType } from '../context/authContext';
import { AuthContext } from '../context/authContext';

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
