import { createContext } from 'react';

export type AuthContextType = {
  initialized: boolean;
  authenticated: boolean;
  token?: string | undefined;
  login: () => void;
  logout: () => void;
  user?: Record<string, unknown>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);