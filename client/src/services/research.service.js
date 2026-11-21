import { apiRequest } from '../lib/api-client.js';

export const ResearchService = {
  async getTrendingRadar(workspaceId, { niche, platform } = {}) {
    const params = new URLSearchParams();
    if (niche) params.append('niche', niche);
    if (platform) params.append('platform', platform);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/workspaces/${workspaceId}/research/trending-radar${query}`);
  },

  async listSources(workspaceId, { sourceType, search } = {}) {
    const params = new URLSearchParams();
    if (sourceType) params.append('sourceType', sourceType);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/workspaces/${workspaceId}/research/sources${query}`);
  },

  async createSource(workspaceId, data) {
    return apiRequest(`/workspaces/${workspaceId}/research/sources`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async listTrends(workspaceId, { status, niche, search } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (niche) params.append('niche', niche);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/workspaces/${workspaceId}/research/trends${query}`);
  },

  async createTrend(workspaceId, data) {
    return apiRequest(`/workspaces/${workspaceId}/research/trends`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTrend(workspaceId, trendId, updates) {
    return apiRequest(`/workspaces/${workspaceId}/research/trends/${trendId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteTrend(workspaceId, trendId) {
    return apiRequest(`/workspaces/${workspaceId}/research/trends/${trendId}`, {
      method: 'DELETE',
    });
  },

  async startResearch(workspaceId, { topic, niche, targetAudience, platform }) {
    return apiRequest(`/workspaces/${workspaceId}/research/start`, {
      method: 'POST',
      body: JSON.stringify({ topic, niche, targetAudience, platform }),
    });
  },
};
