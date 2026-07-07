import { Request, Response, NextFunction } from 'express';
import { TrackerService } from './tracker.service';

const VALID_STATUSES = ['INTERESTED', 'APPLIED', 'APPROVED', 'REJECTED'];

export class TrackerController {
  static async getTracks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      const data = await TrackerService.getTracks(userId);
      res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUpcomingDeadlines(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      const data = await TrackerService.getUpcomingDeadlines(userId);
      res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async upsertTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      const { schemeId, status, notes } = req.body;
      if (!schemeId) throw { statusCode: 400, message: 'schemeId is required' };
      if (!status) throw { statusCode: 400, message: 'status is required' };

      // Validate status enum
      if (!VALID_STATUSES.includes(status)) {
        throw { statusCode: 400, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` };
      }

      const data = await TrackerService.upsertTrack(userId, schemeId, status, notes);
      res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTrack(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };

      const schemeId = req.params.schemeId as string;
      const data = await TrackerService.deleteTrack(userId, schemeId);
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
