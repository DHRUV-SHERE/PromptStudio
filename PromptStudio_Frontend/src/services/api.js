import axios from 'axios';

// Create axios instance
const api = axios.create({
    baseURL: 'https://promptstudio-av40.onrender.com/',
    withCredentials: true, // IMPORTANT: Send cookies
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

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        // Access token is in HTTP-only cookie, so we don't need to set it manually
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and not a refresh request
        if (error.response?.status === 401 && !originalRequest._retry) {

            // If we're already refreshing, add to queue
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers['Authorization'] = 'Bearer ' + token;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the token
                const response = await axios.post(
                    'http://localhost:5000/api/auth/refresh',
                    {},
                    { withCredentials: true }
                );

                const { accessToken } = response.data;

                // Process the queue
                processQueue(null, accessToken);
                isRefreshing = false;

                // Retry the original request
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh failed - clear tokens and redirect to login
                processQueue(refreshError, null);
                isRefreshing = false;

                // Clear any stored tokens
                localStorage.removeItem('access_token');

                // Redirect to login if not already there
                if (!window.location.pathname.includes('/login')) {
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
        return response.data;
    },

    logoutAll: async () => {
        const response = await api.post('/auth/logout-all');
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },


    // Check if user is authenticated by trying to get current user
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

    // Optional: Save prompt to backend
    savePrompt: async (promptData) => {
        const response = await api.post('/prompts/save', promptData);
        return response.data;
    }

};



export default api;