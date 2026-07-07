import { api } from '../../../lib/api';

export interface UserProfile {
  name: string;
  email: string;
  age: number | null;
  income: number | null;
  gender: string | null;
  state: string | null;
  occupation: string | null;
}

export interface UpdateProfilePayload {
  age: number;
  income: number;
  gender: string;
  state: string;
  occupation: string;
}

export const getProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get('/profile');
  return data.data;
};

export const updateProfile = async (payload: UpdateProfilePayload): Promise<UserProfile> => {
  const { data } = await api.put('/profile', payload);
  return data.data;
};
