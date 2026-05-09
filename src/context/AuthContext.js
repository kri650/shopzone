import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('shopzone_token');

    const bootstrap = async () => {
      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        const me = await authService.me();
        localStorage.setItem('shopzone_user', JSON.stringify(me));
        setUser(me);
      } catch (err) {
        console.warn('Bootstrap fetch failed, keeping local session');
        const cachedUser = localStorage.getItem('shopzone_user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        } else {
          setUser(null);
          setToken(null);
        }
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = (newToken, userData) => {
    localStorage.setItem('shopzone_user', JSON.stringify(userData));
    localStorage.setItem('shopzone_token', newToken);
    setUser(userData);
    setToken(newToken);
  };

  const refreshMe = async () => {
    const me = await authService.me();
    localStorage.setItem('shopzone_user', JSON.stringify(me));
    setUser(me);
    return me;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Local cleanup still happens even if API logout fails
    }
    localStorage.removeItem('shopzone_user');
    localStorage.removeItem('shopzone_token');
    setUser(null);
    setToken(null);
  };

  const role = user?.role || null;
  const isAuthenticated = !!user && !!token;
  const value = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated,
      login,
      logout,
      loading,
      refreshMe,
      setUser
    }),
    [user, token, role, isAuthenticated, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
