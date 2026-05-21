import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session exists in local storage
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user_info');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Error parsing local storage auth session", err);
        // Clear corrupt data
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_info');
      }
    }
    setLoading(false);
  }, []);

  const login = (jwtToken, userInfo) => {
    localStorage.setItem('jwt_token', jwtToken);
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    setToken(jwtToken);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_info');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, loading, login, logout }}>
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
