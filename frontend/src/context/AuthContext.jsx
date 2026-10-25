import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('ownly_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('ownly_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const savedToken = localStorage.getItem('ownly_token');
      if (savedToken) {
        try {
          const res = await authService.me();
          if (res.success && res.user) {
            setCurrentUser(res.user);
            localStorage.setItem('ownly_user', JSON.stringify(res.user));
          }
        } catch {
          // Token expired or invalid
          setCurrentUser(null);
          setToken(null);
          localStorage.removeItem('ownly_token');
          localStorage.removeItem('ownly_user');
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setCurrentUser(res.user);
      localStorage.setItem('ownly_token', res.token);
      localStorage.setItem('ownly_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await authService.register({ name, email, password, confirmPassword });
    if (res.success && res.token) {
      setToken(res.token);
      setCurrentUser(res.user);
      localStorage.setItem('ownly_token', res.token);
      localStorage.setItem('ownly_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('ownly_token');
    localStorage.removeItem('ownly_user');
  };

  const updateUser = (updatedData) => {
    setCurrentUser((prev) => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('ownly_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated: !!token && !!currentUser,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
