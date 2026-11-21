import { Router } from 'express';
import { UserController } from './user.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { z } from 'zod';

const router = Router();

const updateUserSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  avatarUrl: z.string().url().nullable().optional(),
});

router.use(requireAuth);

router.get('/me', asyncHandler(UserController.getMe));
router.patch('/me', validateRequest({ body: updateUserSchema }), asyncHandler(UserController.updateMe));

export default router;
