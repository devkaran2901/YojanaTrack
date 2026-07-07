import { Router } from 'express';
import { SchemeController } from './scheme.controller';
import { validate } from '../../middleware/validate.middleware';
import { 
  schemeQueryRouteSchema, 
  matchEligibilityRouteSchema, 
  createSchemeRouteSchema, 
  updateSchemeRouteSchema,
  deleteSchemeRouteSchema,
  getSchemeBySlugRouteSchema
} from './scheme.schema';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';

export const schemeRouter = Router();

schemeRouter.get('/', validate(schemeQueryRouteSchema), SchemeController.getSchemes);
schemeRouter.post('/match', requireAuth, validate(matchEligibilityRouteSchema), SchemeController.matchEligibility);
schemeRouter.post('/', requireAuth, requireAdmin, validate(createSchemeRouteSchema), SchemeController.createScheme);
schemeRouter.put('/:id', requireAuth, requireAdmin, validate(updateSchemeRouteSchema), SchemeController.updateScheme);
schemeRouter.delete('/:id', requireAuth, requireAdmin, validate(deleteSchemeRouteSchema), SchemeController.deleteScheme);
schemeRouter.get('/:slug', validate(getSchemeBySlugRouteSchema), SchemeController.getSchemeBySlug);

