import { api } from '../../../lib/api';
import type { Scheme } from './schemes';

export type ApplicationStatus = 'INTERESTED' | 'APPLIED' | 'APPROVED' | 'REJECTED';

export interface ApplicationTrack {
  id: string;
  userId: string;
  schemeId: string;
  status: ApplicationStatus;
  notes: string | null;
  updatedAt: string;
  scheme: Scheme;
}

export const getTracks = async (): Promise<ApplicationTrack[]> => {
  const { data } = await api.get('/tracker');
  return data.data;
};

export const upsertTrack = async (payload: { schemeId: string; status: ApplicationStatus; notes?: string }): Promise<ApplicationTrack> => {
  const { data } = await api.post('/tracker', payload);
  return data.data;
};

export const deleteTrack = async (schemeId: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/tracker/${schemeId}`);
  return data.data;
};
