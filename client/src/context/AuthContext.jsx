import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('mospi_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [availableUsers, setAvailableUsers] = useState([]);

  useEffect(() => {
    fetch('/api/auth/users')
      .then(res => res.json())
      .then(data => {
        if (data.users) setAvailableUsers(data.users);
      })
      .catch(err => console.warn('Could not fetch user list:', err));
  }, []);

  const login = async ({ identifier, password }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('mospi_user', JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem('mospi_token', data.token);
        }
        return { success: true, user: data.user };
      }
      return { 
        success: false, 
        message: data.message || 'Invalid credentials. Please verify your email/ID and password.' 
      };
    } catch (err) {
      console.error('Login error:', err);
      return { 
        success: false, 
        message: 'Unable to connect to government authentication server. Please check your connection.' 
      };
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('mospi_token') || '';
    return {
      'x-user-id': user?.id || '',
      'x-user-role': user?.role || '',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const authFetch = (url, options = {}) => {
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {})
    };
    return fetch(url, { ...options, headers });
  };

  const switchDemoUser = (targetUserId) => {
    const found = availableUsers.find(u => u.id === targetUserId);
    if (found) {
      setUser(found);
      localStorage.setItem('mospi_user', JSON.stringify(found));
    }
  };

  const logout = () => {
    localStorage.removeItem('mospi_user');
    localStorage.removeItem('mospi_token');
    localStorage.removeItem('mospi_active_tab');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, availableUsers, login, logout, switchDemoUser, getAuthHeaders, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
