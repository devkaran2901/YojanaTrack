import { api } from '../../../lib/api';

export interface Scheme {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  state: string | null;
  minAge: number | null;
  maxAge: number | null;
  maxIncome: number | null;
  gender: string;
  occupation: string | null;
  benefits: string;
  documentsRequired: string[];
  applicationUrl: string;
  ministry: string;
  isActive?: boolean;
  matchScore?: number;
  totalApplicable?: number;
  totalPassed?: number;
  details?: { criterion: string; passed: boolean; reason?: string }[];
  verifiedAt?: string | null;
  deadline?: string | null;
}

export interface SchemesResponse {
  schemes: Scheme[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getSchemes = async (params?: any): Promise<SchemesResponse> => {
  const { data } = await api.get('/schemes', { params });
  return data.data;
};

export const getSchemeBySlug = async (slug: string): Promise<Scheme> => {
  const { data } = await api.get(`/schemes/${slug}`);
  return data.data;
};

export interface MatchEligibilityPayload {
  age: number;
  income: number;
  gender: string;
  state: string;
  occupation: string;
}

export const matchSchemes = async (payload: MatchEligibilityPayload): Promise<Scheme[]> => {
  const { data } = await api.post('/schemes/match', payload);
  return data.data;
};

export const createScheme = async (payload: Omit<Scheme, 'id' | 'slug'>): Promise<Scheme> => {
  const { data } = await api.post('/schemes', payload);
  return data.data;
};

export const updateScheme = async (id: string, payload: Partial<Omit<Scheme, 'id' | 'slug'>>): Promise<Scheme> => {
  const { data } = await api.put(`/schemes/${id}`, payload);
  return data.data;
};

export const deleteScheme = async (id: string): Promise<{ success: boolean }> => {
  const { data } = await api.delete(`/schemes/${id}`);
  return data.data;
};

