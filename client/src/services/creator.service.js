import { apiRequest } from '../lib/api-client.js';

export const CreatorService = {
  async getProfile(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/creator-profile`);
  },

  async upsertProfile(workspaceId, profileData) {
    return apiRequest(`/workspaces/${workspaceId}/creator-profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async updateProfile(workspaceId, updates) {
    return apiRequest(`/workspaces/${workspaceId}/creator-profile`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async getDashboardSummary(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/dashboard`);
  },
};
