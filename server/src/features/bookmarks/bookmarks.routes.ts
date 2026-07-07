import { Router } from 'express';
import { BookmarksController } from './bookmarks.controller';
import { requireAuth } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addBookmarkSchema, removeBookmarkSchema } from './bookmarks.schema';

export const bookmarksRouter = Router();

// Apply auth middleware to all bookmark routes
bookmarksRouter.use(requireAuth);

bookmarksRouter.get('/', BookmarksController.getBookmarks);
bookmarksRouter.post('/', validate(addBookmarkSchema), BookmarksController.addBookmark);
bookmarksRouter.delete('/:schemeId', validate(removeBookmarkSchema), BookmarksController.removeBookmark);
