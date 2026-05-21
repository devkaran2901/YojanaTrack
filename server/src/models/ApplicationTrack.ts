import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IApplicationTrack extends Document {
  _id: Types.ObjectId;
  userId: string;
  schemeId: string;
  status: 'INTERESTED' | 'APPLIED' | 'APPROVED' | 'REJECTED';
  notes?: string;
  updatedAt: Date;
}

const applicationTrackSchema = new Schema<IApplicationTrack>(
  {
    userId: { type: String, required: true, ref: 'User' },
    schemeId: { type: String, required: true, ref: 'Scheme' },
    status: { type: String, enum: ['INTERESTED', 'APPLIED', 'APPROVED', 'REJECTED'], default: 'INTERESTED' },
    notes: String,
  },
  { timestamps: true }
);

applicationTrackSchema.index({ userId: 1, schemeId: 1 }, { unique: true });
applicationTrackSchema.index({ userId: 1 });

export const ApplicationTrack = mongoose.model<IApplicationTrack>('ApplicationTrack', applicationTrackSchema);
