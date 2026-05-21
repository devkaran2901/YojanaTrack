import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IScheme extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  category: string;
  state?: string | null;
  minAge?: number | null;
  maxAge?: number | null;
  maxIncome?: number | null;
  gender?: string;
  occupation?: string | null;
  benefits: string;
  documentsRequired: string[];
  applicationUrl?: string | null;
  ministry?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const schemeSchema = new Schema<IScheme>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    state: String,
    minAge: Number,
    maxAge: Number,
    maxIncome: Number,
    gender: String,
    occupation: String,
    benefits: { type: String, required: true },
    documentsRequired: { type: [String], default: [] },
    applicationUrl: String,
    ministry: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schemeSchema.index({ category: 1 });
schemeSchema.index({ state: 1 });

export const Scheme = mongoose.model<IScheme>('Scheme', schemeSchema);
