import { apiRequest } from '../lib/api-client.js';

export const HookService = {
  async listHooks(workspaceId, { category, niche, search } = {}) {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (niche) params.append('niche', niche);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/workspaces/${workspaceId}/hooks${query}`);
  },

  async createHook(workspaceId, data) {
    return apiRequest(`/workspaces/${workspaceId}/hooks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateHook(workspaceId, hookId, updates) {
    return apiRequest(`/workspaces/${workspaceId}/hooks/${hookId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteHook(workspaceId, hookId) {
    return apiRequest(`/workspaces/${workspaceId}/hooks/${hookId}`, {
      method: 'DELETE',
    });
  },
};
