import { HookService } from './hook.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class HookController {
  static async list(req, res) {
    const hooks = await HookService.listHooks(req.params.workspaceId, {
      category: req.query.category,
      niche: req.query.niche,
      search: req.query.search,
    });
    return ApiResponse.success(res, hooks);
  }

  static async create(req, res) {
    const hook = await HookService.createHook(req.params.workspaceId, req.body);
    return ApiResponse.created(res, hook);
  }

  static async update(req, res) {
    const updated = await HookService.updateHook(req.params.workspaceId, req.params.id, req.body);
    return ApiResponse.success(res, updated);
  }

  static async delete(req, res) {
    await HookService.deleteHook(req.params.workspaceId, req.params.id);
    return ApiResponse.noContent(res);
  }
}
