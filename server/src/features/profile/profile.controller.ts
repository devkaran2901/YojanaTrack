import { Request, Response, NextFunction } from 'express';
import { User } from '../../models/User';

export class ProfileController {
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw { statusCode: 401, message: 'Unauthorized' };
      }

      const user = await User.findById(userId).select('-passwordHash').lean();
      if (!user) {
        throw { statusCode: 404, message: 'User not found' };
      }

      res.status(200).json({
        success: true,
        data: {
          name: user.name,
          email: user.email,
          age: user.age ?? null,
          income: user.income ?? null,
          gender: user.gender ?? null,
          state: user.state ?? null,
          occupation: user.occupation ?? null,
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw { statusCode: 401, message: 'Unauthorized' };
      }

      const { age, income, gender, state, occupation } = req.body;

      const user = await User.findByIdAndUpdate(
        userId,
        { age, income, gender, state, occupation },
        { new: true }
      ).select('-passwordHash').lean();

      if (!user) {
        throw { statusCode: 404, message: 'User not found' };
      }

      res.status(200).json({
        success: true,
        data: {
          name: user.name,
          email: user.email,
          age: user.age ?? null,
          income: user.income ?? null,
          gender: user.gender ?? null,
          state: user.state ?? null,
          occupation: user.occupation ?? null,
        },
        error: null,
      });
    } catch (error) {
      next(error);
    }
  }
}
