import { Router } from 'express';
import { TrackerController } from './tracker.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { upsertTrackSchema, deleteTrackSchema } from './tracker.schema';

export const trackerRouter = Router();

// Apply auth middleware to all tracker routes
trackerRouter.use(requireAuth);

trackerRouter.get('/', TrackerController.getTracks);
trackerRouter.get('/upcoming-deadlines', TrackerController.getUpcomingDeadlines);
trackerRouter.post('/', validate(upsertTrackSchema), TrackerController.upsertTrack);
trackerRouter.delete('/:schemeId', validate(deleteTrackSchema), TrackerController.deleteTrack);
