import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'USER' | 'ADMIN';
  state?: string;
  age?: number;
  income?: number;
  occupation?: string;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    state: String,
    age: Number,
    income: Number,
    occupation: String,
    gender: String,
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', userSchema);
