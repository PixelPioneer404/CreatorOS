import { WorkspaceService } from './workspace.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class WorkspaceController {
  static async list(req, res) {
    const workspaces = await WorkspaceService.listUserWorkspaces(req.user.id);
    return ApiResponse.success(res, workspaces);
  }

  static async create(req, res) {
    const workspace = await WorkspaceService.createWorkspace(req.user.id, {
      name: req.body.name,
      slug: req.body.slug,
      idempotent: req.body.idempotent !== false,
    });
    return ApiResponse.created(res, workspace);
  }

  static async getById(req, res) {
    const workspace = await WorkspaceService.getWorkspaceById(req.params.workspaceId, req.user.id);
    return ApiResponse.success(res, workspace);
  }

  static async update(req, res) {
    const updated = await WorkspaceService.updateWorkspace(req.params.workspaceId, req.body);
    return ApiResponse.success(res, updated);
  }

  static async listMembers(req, res) {
    const members = await WorkspaceService.listMembers(req.params.workspaceId);
    return ApiResponse.success(res, members);
  }
}
