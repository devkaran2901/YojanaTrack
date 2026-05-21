import { Bookmark } from '../../models/Bookmark';
import { Scheme } from '../../models/Scheme';

export class BookmarksService {
  static async getBookmarks(userId: string) {
    return Bookmark.find({ userId }).populate({ path: 'schemeId', model: Scheme }).sort({ createdAt: -1 }).lean();
  }

  static async addBookmark(userId: string, schemeId: string) {
    // Check if scheme exists
    const scheme = await Scheme.findById(schemeId).lean();
    if (!scheme) throw { statusCode: 404, message: 'Scheme not found' };

    // Create or retrieve bookmark (unique index prevents duplicates)
    try {
      const created = await Bookmark.create({ userId, schemeId });
      await created.populate({ path: 'schemeId', model: Scheme });
      return created.toObject();
    } catch (err: any) {
      // If duplicate key (already bookmarked), return existing
      if (err.code === 11000) {
        const existing = await Bookmark.findOne({ userId, schemeId }).populate({ path: 'schemeId', model: Scheme }).lean();
        return existing;
      }
      throw err;
    }
  }

  static async removeBookmark(userId: string, schemeId: string) {
    const bookmark = await Bookmark.findOne({ userId, schemeId });
    if (!bookmark) throw { statusCode: 404, message: 'Bookmark not found' };

    await Bookmark.deleteOne({ userId, schemeId });
    return { success: true };
  }
}
