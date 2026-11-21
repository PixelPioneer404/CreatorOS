import { UserService } from './user.service.js';
import { ApiResponse } from '../../utils/api-response.js';

export class UserController {
  static async getMe(req, res) {
    const user = await UserService.getCurrentUser(req.user.id, {
      displayName: req.user.user_metadata?.display_name || req.user.email?.split('@')[0],
      avatarUrl: req.user.user_metadata?.avatar_url,
    });
    return ApiResponse.success(res, {
      ...user,
      email: req.user.email,
    });
  }

  static async updateMe(req, res) {
    const updated = await UserService.updateUser(req.user.id, req.body);
    return ApiResponse.success(res, {
      ...updated,
      email: req.user.email,
    });
  }
}
