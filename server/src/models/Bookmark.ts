import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBookmark extends Document {
  _id: Types.ObjectId;
  userId: string;
  schemeId: string;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    userId: { type: String, required: true, ref: 'User' },
    schemeId: { type: String, required: true, ref: 'Scheme' },
  },
  { timestamps: true }
);

bookmarkSchema.index({ userId: 1, schemeId: 1 }, { unique: true });
bookmarkSchema.index({ userId: 1 });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
