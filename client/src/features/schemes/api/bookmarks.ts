import { api } from '../../../lib/api';
import type { Scheme } from './schemes';

export interface Bookmark {
  id: string;
  userId: string;
  schemeId: string;
  createdAt: string;
  scheme: Scheme;
}

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const { data } = await api.get('/bookmarks');
  return data.data;
};

export const addBookmark = async (schemeId: string): Promise<Bookmark> => {
  const { data } = await api.post('/bookmarks', { schemeId });
  return data.data;
};

export const removeBookmark = async (schemeId: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/bookmarks/${schemeId}`);
  return data.data;
};
