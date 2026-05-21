import { Router } from 'express';
import { SchemeController } from './scheme.controller';
import { validate } from '../../middleware/validate.middleware';
import { schemeQuerySchema, matchEligibilitySchema, createSchemeSchema, updateSchemeSchema } from './scheme.schema';
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware';

export const schemeRouter = Router();

schemeRouter.get('/', validate(schemeQuerySchema, 'query'), SchemeController.getSchemes);
schemeRouter.post('/match', requireAuth, validate(matchEligibilitySchema, 'body'), SchemeController.matchEligibility);
schemeRouter.post('/', requireAuth, requireAdmin, validate(createSchemeSchema, 'body'), SchemeController.createScheme);
schemeRouter.put('/:id', requireAuth, requireAdmin, validate(updateSchemeSchema, 'body'), SchemeController.updateScheme);
schemeRouter.delete('/:id', requireAuth, requireAdmin, SchemeController.deleteScheme);
schemeRouter.get('/:slug', SchemeController.getSchemeBySlug);

