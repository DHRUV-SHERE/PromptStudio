import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: 'https://promptstudio-vqbn.onrender.com/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Request interceptor - ADD BACK Authorization header
api.interceptors.request.use(
    (config) => {
        // Try to get token from localStorage first (set by login response)
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - FIXED to prevent infinite loops
api.interceptors.response.use(
    (response) => {
        // If login/register response has accessToken, store it
        if (response.data?.accessToken && 
            (response.config.url.includes('/login') || 
             response.config.url.includes('/register'))) {
            localStorage.setItem('access_token', response.data.accessToken);
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // Don't retry auth endpoints (except refresh)
            if (originalRequest.url.includes('/auth/logout') || 
                originalRequest.url.includes('/auth/login') ||
                originalRequest.url.includes('/auth/register')) {
                return Promise.reject(error);
            }

            // If already refreshing, add to queue
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log('🔄 Attempting token refresh...');
                
                // Use a separate axios instance for refresh to avoid interceptors
                const refreshAxios = axios.create({
                    baseURL: 'https://promptstudio-vqbn.onrender.com/api',
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                // Call refresh endpoint
                const refreshResponse = await refreshAxios.post('/auth/refresh', {});
                
                console.log('✅ Token refresh successful');
                
                // Update stored access token if new one is returned
                if (refreshResponse.data?.accessToken) {
                    localStorage.setItem('access_token', refreshResponse.data.accessToken);
                }
                
                processQueue(null, refreshResponse.data?.accessToken);
                isRefreshing = false;
                
                // Retry the original request with updated token
                const token = localStorage.getItem('access_token');
                if (token) {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                }
                
                return api(originalRequest);

            } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);
                
                processQueue(refreshError, null);
                isRefreshing = false;
                
                // Clear all auth data
                localStorage.removeItem('access_token');
                
                // Only redirect if not already on login page
                if (!window.location.pathname.includes('/login') && 
                    !window.location.pathname.includes('/register')) {
                    window.location.href = '/login';
                }
                
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

// Auth API functions
export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh');
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        // Clear localStorage on logout
        localStorage.removeItem('access_token');
        return response.data;
    },

    logoutAll: async () => {
        const response = await api.post('/auth/logout-all');
        localStorage.removeItem('access_token');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    isAuthenticated: async () => {
        try {
            await api.get('/auth/me');
            return true;
        } catch (error) {
            return false;
        }
    },
    
    generatePrompt: async (promptData) => {
        const response = await api.post('/prompts/generate', promptData);
        return response.data;
    },

    getPromptHistory: async (params = {}) => {
        const response = await api.get('/prompts/history', { params });
        return response.data;
    },

    deletePrompt: async (promptId) => {
        const response = await api.delete(`/prompts/${promptId}`);
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/prompts/categories');
        return response.data;
    },

    savePrompt: async (promptData) => {
        const response = await api.post('/prompts/save', promptData);
        return response.data;
    }
};

// Helper function to set up proactive refresh
let refreshTimer = null;

export const startTokenRefreshTimer = (expiresInMinutes = 15) => {
    if (refreshTimer) clearTimeout(refreshTimer);
    
    // Convert minutes to milliseconds and refresh 1 minute before expiry
    const expiresInMs = expiresInMinutes * 60 * 1000;
    const refreshTime = expiresInMs - 60000; // 1 minute before
    
    if (refreshTime > 0) {
        refreshTimer = setTimeout(async () => {
            try {
                console.log('⏰ Proactively refreshing token...');
                await authAPI.refreshToken();
                console.log('✅ Token refreshed proactively');
                // Restart the timer
                startTokenRefreshTimer(expiresInMinutes);
            } catch (error) {
                console.error('❌ Proactive refresh failed:', error);
            }
        }, refreshTime);
    }
};

// Clear timer on logout
export const clearTokenRefreshTimer = () => {
    if (refreshTimer) {
        clearTimeout(refreshTimer);
        refreshTimer = null;
    }
};

export default api;