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
        // First check if we have a token
        const token = localStorage.getItem('access_token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        
        const response = await authAPI.getCurrentUser();
        setUser(response.user);
    } catch (error) {
        console.log('Auth check failed:', error.message);
        setUser(null);
        
        // If 401, try to refresh token
        if (error.response?.status === 401) {
            try {
                await authAPI.refreshToken();
                // Retry getting user after refresh
                const response = await authAPI.getCurrentUser();
                setUser(response.user);
            } catch (refreshError) {
                console.log('Token refresh failed:', refreshError.message);
            }
        }
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
            // Store token
            localStorage.setItem('access_token', result.accessToken);
            setUser(result.user);
        }
        return result;
    } catch (error) {
        throw error;
    }
};

const logout = async () => {
    try {
        await authAPI.logout();
        // Clear localStorage
        localStorage.removeItem('access_token');
        setUser(null);
    } catch (error) {
        console.error('Logout error:', error);
    }
};
    const logoutAll = async () => {
        try {
            await authAPI.logoutAll();
            setUser(null);
        } catch (error) {
            console.error('Logout all error:', error);
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
        refreshUser: checkAuth // Function to refresh user data
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};