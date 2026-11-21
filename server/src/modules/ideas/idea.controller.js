import { IdeaService } from './idea.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class IdeaController {
  static async list(req, res) {
    const ideas = await IdeaService.listIdeas(req.params.workspaceId, {
      status: req.query.status,
      niche: req.query.niche,
      format: req.query.format,
      search: req.query.search,
    });
    return ApiResponse.success(res, ideas);
  }

  static async getById(req, res) {
    const idea = await IdeaService.getIdeaById(req.params.workspaceId, req.params.id);
    return ApiResponse.success(res, idea);
  }

  static async create(req, res) {
    const idea = await IdeaService.createIdea(req.params.workspaceId, req.body);
    return ApiResponse.created(res, idea);
  }

  static async update(req, res) {
    const updated = await IdeaService.updateIdea(req.params.workspaceId, req.params.id, req.body);
    return ApiResponse.success(res, updated);
  }

  static async delete(req, res) {
    await IdeaService.deleteIdea(req.params.workspaceId, req.params.id);
    return ApiResponse.noContent(res);
  }

  static async generate(req, res) {
    const result = await IdeaService.generateAiIdeas(req.params.workspaceId, req.body);
    return ApiResponse.success(res, result);
  }
}
