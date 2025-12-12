import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI, startTokenRefreshTimer, clearTokenRefreshTimer } from '../services/api'; // Import timer functions

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
        
        // Cleanup timer on unmount
        return () => {
            clearTokenRefreshTimer();
        };
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            setUser(response.user);
            
            // Start proactive refresh timer (15 minutes)
            startTokenRefreshTimer(15);
            
            return true;
        } catch (error) {
            console.log('Auth check failed:', error.message);
            
            // Try to refresh token if it's a 401
            if (error.response?.status === 401) {
                try {
                    console.log('🔄 Auto-refreshing token...');
                    await authAPI.refreshToken();
                    
                    // Try again after refresh
                    const retryResponse = await authAPI.getCurrentUser();
                    setUser(retryResponse.user);
                    startTokenRefreshTimer(15);
                    return true;
                } catch (refreshError) {
                    console.log('Auto-refresh failed:', refreshError.message);
                }
            }
            
            setUser(null);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const result = await authAPI.login(credentials);
            if (result.success && result.accessToken) {
                // Store token in localStorage
                localStorage.setItem('access_token', result.accessToken);
                setUser(result.user);
                
                // Start proactive refresh timer
                startTokenRefreshTimer(15);
                
                return {
                    success: true,
                    user: result.user
                };
            }
            return result;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const result = await authAPI.register(userData);
            if (result.success && result.accessToken) {
                localStorage.setItem('access_token', result.accessToken);
                setUser(result.user);
                
                // Start proactive refresh timer
                startTokenRefreshTimer(15);
                
                return {
                    success: true,
                    user: result.user
                };
            }
            return result;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Always clear
            localStorage.removeItem('access_token');
            clearTokenRefreshTimer();
            setUser(null);
        }
    };

    const logoutAll = async () => {
        try {
            await authAPI.logoutAll();
        } catch (error) {
            console.error('Logout all error:', error);
        } finally {
            localStorage.removeItem('access_token');
            clearTokenRefreshTimer();
            setUser(null);
        }
    };

    const value = {
        user,
        login,
        register,
        logout,
        logoutAll,
        isAuthenticated: !!user,
        loading,
        refreshUser: checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};