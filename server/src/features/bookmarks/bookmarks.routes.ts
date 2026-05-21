import { Router } from 'express';
import { BookmarksController } from './bookmarks.controller';
import { requireAuth } from '../../middleware/auth.middleware';

export const bookmarksRouter = Router();

// Apply auth middleware to all bookmark routes
bookmarksRouter.use(requireAuth);

bookmarksRouter.get('/', BookmarksController.getBookmarks);
bookmarksRouter.post('/', BookmarksController.addBookmark);
bookmarksRouter.delete('/:schemeId', BookmarksController.removeBookmark);
