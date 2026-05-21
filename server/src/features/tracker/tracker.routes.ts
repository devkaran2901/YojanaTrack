import { Router } from 'express';
import { TrackerController } from './tracker.controller';
import { requireAuth } from '../../middleware/auth.middleware';

export const trackerRouter = Router();

// Apply auth middleware to all tracker routes
trackerRouter.use(requireAuth);

trackerRouter.get('/', TrackerController.getTracks);
trackerRouter.post('/', TrackerController.upsertTrack);
trackerRouter.delete('/:schemeId', TrackerController.deleteTrack);
