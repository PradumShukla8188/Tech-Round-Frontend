import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getUserRole, isUserAdmin } from '../utils/authHelpers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedToken !== 'null' && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const loginUser = useCallback((newToken, newUser) => {
    if (!newToken || newToken === 'null' || newToken === 'undefined') {
      return false;
    }
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const role = useMemo(() => getUserRole(user), [user]);
  const isAdmin = useMemo(() => isUserAdmin(user), [user]);
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{ user, token, role, loading, loginUser, logout, isAdmin, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
