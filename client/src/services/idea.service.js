import { apiRequest } from '../lib/api-client.js';

export const IdeaService = {
  async listIdeas(workspaceId, { status, niche, format, search } = {}) {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (niche) params.append('niche', niche);
    if (format && format !== 'all') params.append('format', format);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/workspaces/${workspaceId}/ideas${query}`);
  },

  async getIdeaById(workspaceId, ideaId) {
    return apiRequest(`/workspaces/${workspaceId}/ideas/${ideaId}`);
  },

  async createIdea(workspaceId, data) {
    return apiRequest(`/workspaces/${workspaceId}/ideas`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateIdea(workspaceId, ideaId, updates) {
    return apiRequest(`/workspaces/${workspaceId}/ideas/${ideaId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async deleteIdea(workspaceId, ideaId) {
    return apiRequest(`/workspaces/${workspaceId}/ideas/${ideaId}`, {
      method: 'DELETE',
    });
  },

  async generateAiIdeas(workspaceId, { topic, niche, targetAudience, format, count, additionalInstructions, saveImmediately }) {
    return apiRequest(`/workspaces/${workspaceId}/ideas/generate`, {
      method: 'POST',
      body: JSON.stringify({
        topic,
        niche,
        targetAudience,
        format,
        count,
        additionalInstructions,
        saveImmediately,
      }),
    });
  },
};
