import api from './axios';

export const activityApi = {
    getWorkspaceActivity: (workspaceId, params = {}) => {
        return api.get(`/api/activity/workspaces/${workspaceId}/`, { params });
    },

    getUserActivity: (params = {}) => {
        return api.get('/api/activity/my-activity/', { params });
    },

    getNotebookActivity: (notebookId, params = {}) => {
        return api.get(`/api/activity/notebooks/${notebookId}/`, { params });
    }
};
