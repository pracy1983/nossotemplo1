import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import * as db from '../services/database';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('nosso-templo-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('nosso-templo-user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await db.authenticateUser(email, password);
      
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('nosso-templo-user', JSON.stringify(authenticatedUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error so the component can handle it properly
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('nosso-templo-user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};