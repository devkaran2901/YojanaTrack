import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileRouteSchema } from './profile.schema';

export const profileRouter = Router();

profileRouter.use(requireAuth);

profileRouter.get('/', ProfileController.getProfile);
profileRouter.put('/', validate(updateProfileRouteSchema), ProfileController.updateProfile);
