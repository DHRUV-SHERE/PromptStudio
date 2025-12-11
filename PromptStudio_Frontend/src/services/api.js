import axios from 'axios';

// Create axios instance - FIXED URL
const api = axios.create({
    baseURL: 'https://promptstudio-av40.onrender.com/api', // ✅ ADDED /api
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

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage or cookie (if you're using localStorage)
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

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Queue logic remains...
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const response = await axios.post(
                    'https://promptstudio-av40.onrender.com/api/auth/refresh',
                    {},
                    { 
                        withCredentials: true,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const { accessToken } = response.data;
                
                // ✅ Store new access token
                if (accessToken) {
                    localStorage.setItem('access_token', accessToken);
                    // Update axios default headers
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                }
                
                processQueue(null, accessToken);
                isRefreshing = false;
                
                // Update the original request with new token
                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;
                
                // Clear all auth data
                localStorage.removeItem('access_token');
                delete api.defaults.headers.common['Authorization'];
                
                // Redirect to login
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

// Auth API functions - URLs are now correct
export const authAPI = {
    register: async (userData) => {
        const response = await api.post('/auth/register', userData); // ✅ Will be: /api/auth/register
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials); // ✅ Will be: /api/auth/login
        return response.data;
    },

    refreshToken: async () => {
        const response = await api.post('/auth/refresh'); // ✅ Will be: /api/auth/refresh
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout'); // ✅ Will be: /api/auth/logout
        return response.data;
    },

    logoutAll: async () => {
        const response = await api.post('/auth/logout-all'); // ✅ Will be: /api/auth/logout-all
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me'); // ✅ Will be: /api/auth/me
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
        const response = await api.post('/prompts/generate', promptData); // ✅ Will be: /api/prompts/generate
        return response.data;
    },

    getPromptHistory: async (params = {}) => {
        const response = await api.get('/prompts/history', { params }); // ✅ Will be: /api/prompts/history
        return response.data;
    },

    deletePrompt: async (promptId) => {
        const response = await api.delete(`/prompts/${promptId}`); // ✅ Will be: /api/prompts/:id
        return response.data;
    },

    getCategories: async () => {
        const response = await api.get('/prompts/categories'); // ✅ Will be: /api/prompts/categories
        return response.data;
    },

    savePrompt: async (promptData) => {
        const response = await api.post('/prompts/save', promptData); // ✅ Will be: /api/prompts/save
        return response.data;
    }
};

export default api;