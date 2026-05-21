import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema, source: 'body' | 'query' | 'params' | 'all' = 'all') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (source === 'all') {
        await schema.parseAsync({
          body: req.body,
          query: req.query,
          params: req.params,
        });
      } else {
        await schema.parseAsync(req[source]);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          data: null,
          error: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
        });
      }
      return next(error);
    }
  };
};
