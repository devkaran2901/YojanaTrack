import { ApplicationTrack } from '../../models/ApplicationTrack';
import { Scheme } from '../../models/Scheme';

export class TrackerService {
  static async getTracks(userId: string) {
    return ApplicationTrack.find({ userId }).populate({ path: 'schemeId', model: Scheme }).sort({ updatedAt: -1 }).lean();
  }

  static async getUpcomingDeadlines(userId: string) {
    const tracks = await ApplicationTrack.find({ userId }).populate({ path: 'schemeId', model: Scheme }).lean();
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return tracks.filter((track: any) => {
      if (!track.schemeId || !track.schemeId.deadline) return false;
      const deadlineDate = new Date(track.schemeId.deadline);
      return deadlineDate >= now && deadlineDate <= sevenDaysFromNow;
    });
  }

  static async upsertTrack(userId: string, schemeId: string, status: any, notes?: string) {
    const scheme = await Scheme.findById(schemeId).lean();
    if (!scheme) throw { statusCode: 404, message: 'Scheme not found' };

    try {
      const track = new ApplicationTrack({ userId, schemeId, status, notes });
      await track.save();
      await track.populate({ path: 'schemeId', model: Scheme });
      return track.toObject();
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
