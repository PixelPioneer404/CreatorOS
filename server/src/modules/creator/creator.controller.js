import { CreatorService } from './creator.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class CreatorController {
  static async getProfile(req, res) {
    const profile = await CreatorService.getProfile(req.params.workspaceId);
    return ApiResponse.success(res, profile);
  }

  static async upsertProfile(req, res) {
    const profile = await CreatorService.upsertProfile(req.params.workspaceId, req.body);
    return ApiResponse.success(res, profile);
  }

  static async updateProfile(req, res) {
    const updated = await CreatorService.updateProfile(req.params.workspaceId, req.body);
    return ApiResponse.success(res, updated);
  }

  static async getDashboard(req, res) {
    const summary = await CreatorService.getDashboardSummary(req.params.workspaceId);
    return ApiResponse.success(res, summary);
  }
}
