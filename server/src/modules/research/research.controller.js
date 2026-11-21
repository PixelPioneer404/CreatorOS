import { ResearchService } from './research.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class ResearchController {
  static async listSources(req, res) {
    const sources = await ResearchService.listSources(req.params.workspaceId, {
      sourceType: req.query.sourceType,
      search: req.query.search,
    });
    return ApiResponse.success(res, sources);
  }

  static async createSource(req, res) {
    const source = await ResearchService.createSource(req.params.workspaceId, req.body);
    return ApiResponse.created(res, source);
  }

  static async listTrends(req, res) {
    const trends = await ResearchService.listTrends(req.params.workspaceId, {
      status: req.query.status,
      niche: req.query.niche,
      search: req.query.search,
    });
    return ApiResponse.success(res, trends);
  }

  static async createTrend(req, res) {
    const trend = await ResearchService.createTrend(req.params.workspaceId, req.body);
    return ApiResponse.created(res, trend);
  }

  static async updateTrend(req, res) {
    const updated = await ResearchService.updateTrend(req.params.workspaceId, req.params.id, req.body);
    return ApiResponse.success(res, updated);
  }

  static async deleteTrend(req, res) {
    await ResearchService.deleteTrend(req.params.workspaceId, req.params.id);
    return ApiResponse.noContent(res);
  }

  static async startResearch(req, res) {
    const result = await ResearchService.startResearchTask(req.params.workspaceId, req.body);
    return ApiResponse.success(res, result);
  }
}
