import { Request, Response, NextFunction } from 'express';
import { BookmarksService } from './bookmarks.service';

export class BookmarksController {
  static async getBookmarks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      const data = await BookmarksService.getBookmarks(userId);
      res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      const { schemeId } = req.body;
      if (!schemeId) throw { statusCode: 400, message: 'schemeId is required' };

      const data = await BookmarksService.addBookmark(userId, schemeId);
      res.status(201).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeBookmark(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      const schemeId = req.params.schemeId as string;
      const data = await BookmarksService.removeBookmark(userId, schemeId);
      res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
