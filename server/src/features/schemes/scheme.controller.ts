import { Request, Response, NextFunction } from 'express';
import { SchemeService } from './scheme.service';

export class SchemeController {
  static async getSchemes(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SchemeService.getSchemes(req.query);
      res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSchemeBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = req.params.slug as string;
      const data = await SchemeService.getSchemeBySlug(slug);
      res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async matchEligibility(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) throw { statusCode: 401, message: 'Unauthorized' };
      
      const data = await SchemeService.matchEligibility(userId, req.body);
      res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createScheme(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SchemeService.createScheme(req.body);
      res.status(201).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateScheme(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await SchemeService.updateScheme(id, req.body);
      res.status(200).json({
        success: true,
        data,
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteScheme(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const data = await SchemeService.deleteScheme(id);
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

