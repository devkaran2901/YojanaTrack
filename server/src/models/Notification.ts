import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  schemeId: Types.ObjectId;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    schemeId: { type: Schema.Types.ObjectId, ref: 'Scheme', required: true },
    type: { type: String, required: true, default: 'NEW_SCHEME_MATCH' },
    message: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

// Index on userId + createdAt (newest notifications first)
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
