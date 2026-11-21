import { apiRequest } from '../lib/api-client.js';

export const WorkspaceService = {
  async list() {
    return apiRequest('/workspaces');
  },

  async createOrInit(name, slug) {
    return apiRequest('/workspaces', {
      method: 'POST',
      body: JSON.stringify({
        name,
        slug,
        idempotent: true,
      }),
    });
  },

  async getById(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}`);
  },

  async update(workspaceId, data) {
    return apiRequest(`/workspaces/${workspaceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async listMembers(workspaceId) {
    return apiRequest(`/workspaces/${workspaceId}/members`);
  },
};
