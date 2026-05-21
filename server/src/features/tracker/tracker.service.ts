import { ApplicationTrack } from '../../models/ApplicationTrack';
import { Scheme } from '../../models/Scheme';

export class TrackerService {
  static async getTracks(userId: string) {
    return ApplicationTrack.find({ userId }).populate({ path: 'schemeId', model: Scheme }).sort({ updatedAt: -1 }).lean();
  }

  static async upsertTrack(userId: string, schemeId: string, status: string, notes?: string) {
    const scheme = await Scheme.findById(schemeId).lean();
    if (!scheme) throw { statusCode: 404, message: 'Scheme not found' };

    try {
      const created = await ApplicationTrack.create({ userId, schemeId, status, notes });
      await created.populate({ path: 'schemeId', model: Scheme });
      return created.toObject();
    } catch (err: any) {
      // Duplicate -> update existing
      if (err.code === 11000) {
        const updated = await ApplicationTrack.findOneAndUpdate({ userId, schemeId }, { status, notes }, { new: true }).populate({ path: 'schemeId', model: Scheme }).lean();
        return updated;
      }
      throw err;
    }
  }

  static async deleteTrack(userId: string, schemeId: string) {
    const track = await ApplicationTrack.findOne({ userId, schemeId });
    if (!track) throw { statusCode: 404, message: 'Application track not found' };

    await ApplicationTrack.deleteOne({ userId, schemeId });
    return { success: true };
  }
}
