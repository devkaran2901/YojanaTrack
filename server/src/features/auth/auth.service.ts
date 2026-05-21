import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';
import { RefreshToken } from '../../models/RefreshToken';
import { env } from '../../config/env';
import { RegisterInput, LoginInput } from './auth.schema';

export class AuthService {
  static async register(data: RegisterInput) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw { statusCode: 400, message: 'User already exists' };
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await User.create({
      name: data.name,
      email: data.email,
      passwordHash,
    });

    return this.generateTokens(user._id.toString(), user.role);
  }

  static async login(data: LoginInput) {
    const user = await User.findOne({ email: data.email });
    if (!user) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    const isMatch = await bcrypt.compare(data.password, user.passwordHash);
    if (!isMatch) {
      throw { statusCode: 401, message: 'Invalid credentials' };
    }

    return this.generateTokens(user._id.toString(), user.role);
  }

  static async refresh(token: string) {
    try {
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string; role: string };

      const storedToken = await RefreshToken.findOne({ token });
      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new Error('Token expired or revoked');
      }

      return this.generateTokens(decoded.id, decoded.role);
    } catch (err) {
      throw { statusCode: 401, message: 'Invalid refresh token' };
    }
  }

  static async logout(token: string) {
    await RefreshToken.deleteMany({ token });
  }

  static async generateTokens(userId: string, role: 'USER' | 'ADMIN') {
    const accessToken = jwt.sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId, role }, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    // Store refresh token in DB
    await RefreshToken.create({
      userId,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Return user data from DB
    const user = await User.findById(userId);
    return {
      accessToken,
      refreshToken,
      user: { id: userId, role, name: user?.name },
    };
  }
}
