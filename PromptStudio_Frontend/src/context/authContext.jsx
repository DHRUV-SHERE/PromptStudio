import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await authAPI.getCurrentUser();
            setUser(response.user);
        } catch (error) {
            console.log('Auth check failed:', error.message);
            setUser(null);
            
            // Clear invalid token
            localStorage.removeItem('access_token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            const result = await authAPI.login(credentials);
            if (result.success && result.accessToken) {
                // Store token
                localStorage.setItem('access_token', result.accessToken);
                setUser(result.user);
                
                // ✅ Return user data for redirection
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
                
                // ✅ Return user data for redirection
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
            // Always clear local state
            localStorage.removeItem('access_token');
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