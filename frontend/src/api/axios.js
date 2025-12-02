import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to inject the token if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    const response = await axios.post('http://127.0.0.1:8000/api/auth/token/refresh/', {
                        refresh: refreshToken
                    });

                    if (response.status === 200) {
                        const { access } = response.data;
                        localStorage.setItem('access_token', access);

                        // Update header for original request
                        originalRequest.headers.Authorization = `Bearer ${access}`;

                        // Retry original request
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    // Refresh failed - clear tokens and redirect
                    console.error('Token refresh failed:', refreshError);
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                }
            } else {
                // No refresh token available
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const labelsApi = {
    list: (workspaceId) => api.get(`/api/labels/?workspace_id=${workspaceId}`),
    create: (data) => api.post('/api/labels/', data),
    update: (id, data) => api.patch(`/api/labels/${id}/`, data),
    delete: (id) => api.delete(`/api/labels/${id}/`),
    addToNotebook: (notebookId, labelId) => api.post(`/api/labels/notebooks/${notebookId}/labels/add/`, { label_id: labelId }),
    removeFromNotebook: (notebookId, labelId) => api.delete(`/api/labels/notebooks/${notebookId}/labels/${labelId}/remove/`),
    listForNotebook: (notebookId) => api.get(`/api/labels/notebooks/${notebookId}/labels/`),
};

export const searchApi = {
    notebooks: (query, workspaceId = null, labels = []) => {
        let url = `/api/search/notebooks/?q=${query}`;
        if (workspaceId) url += `&workspace_id=${workspaceId}`;
        if (labels.length > 0) url += `&labels=${labels.join(',')}`;
        return api.get(url);
    },
    workspaces: (query) => api.get(`/api/search/workspaces/?q=${query}`),
};

export const sharingApi = {
    list: (notebookId) => api.get(`/api/share/?notebook_id=${notebookId}`),
    create: (data) => api.post('/api/share/create/', data),
    update: (id, data) => api.patch(`/api/share/${id}/`, data),
    revoke: (id) => api.delete(`/api/share/${id}/`),
    access: (token, password = null) => {
        const config = {};
        if (password) {
            config.data = { password };
            return api.get(`/api/share/access/${token}/`, { data: { password } });
        }
        return api.get(`/api/share/access/${token}/`);
    },
    edit: (token, data, password = null) => {
        const payload = { ...data };
        if (password) {
            payload.password = password;
        }
        return api.patch(`/api/share/edit/${token}/`, payload);
    }
};

export default api;
