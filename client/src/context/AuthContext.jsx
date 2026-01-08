import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { API_BASE } from '../config/api';

const AuthContext = createContext();

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    id: user._id || user.id,
    isVerified: user.isVerified || false
  };
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: normalizeUser(action.payload.user),
        token: action.payload.accessToken,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: normalizeUser(data.user), accessToken: token }
        });
      } else {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('accessToken', refreshData.accessToken);
              localStorage.setItem('refreshToken', refreshData.refreshToken);

              const userResponse = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${refreshData.accessToken}` }
              });

              if (userResponse.ok) {
                const userData = await userResponse.json();
                dispatch({
                  type: 'LOGIN_SUCCESS',
                  payload: { user: normalizeUser(userData.user), accessToken: refreshData.accessToken }
                });
              } else {
                throw new Error('Failed to get user data with refreshed token');
              }
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            dispatch({ type: 'LOGOUT' });
          }
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          dispatch({ type: 'LOGOUT' });
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      dispatch({ type: 'LOGOUT' });
      return false;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: normalizeUser(data.user),
            accessToken: token
          }
        });

        return true;
      } else {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();

            localStorage.setItem('accessToken', refreshData.accessToken);
            localStorage.setItem('refreshToken', refreshData.refreshToken);

            const userResponse = await fetch(`${API_BASE}/auth/me`, {
              headers: { 'Authorization': `Bearer ${refreshData.accessToken}` }
            });

            if (userResponse.ok) {
              const userData = await userResponse.json();

              dispatch({
                type: 'LOGIN_SUCCESS',
                payload: {
                  user: normalizeUser(userData.user),
                  accessToken: refreshData.accessToken
                }
              });

              return true;
            }
          }
        }

        dispatch({ type: 'LOGOUT' });
        return false;
      }
    } catch (error) {
      dispatch({ type: 'LOGOUT' });
      return false;
    }
  };

  const signup = async (userData) => {
    dispatch({ type: 'LOGIN_START' });

    try {

      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.errors?.[0]?.msg || 'Signup failed';
        dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
        return { success: false, error: errorMessage };
      }

      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'CLEAR_ERROR' });

      return { success: true, message: data.message || 'Account created. Please verify your email.' };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: 'Network error. Please try again.' });
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: normalizeUser(data.user), accessToken: data.accessToken }
        });
        return { success: true };
      } else {
        let errorMessage = data.error || data.errors?.[0]?.msg || 'Login failed';

        if (errorMessage.includes('email not verified')) {
          errorMessage = 'Please verify your email before logging in';
        }

        dispatch({
          type: 'LOGIN_FAILURE',
          payload: errorMessage
        });
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: 'Network error. Please try again.'
      });
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      // Silent fail
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    signup,
    login,
    logout,
    clearError,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
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