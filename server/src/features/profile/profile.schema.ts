import { z } from 'zod';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir'
] as const;

const OCCUPATIONS = [
  'Farmer', 'Student', 'Unemployed', 'Self Employed', 'Salaried', 'Senior Citizen', 'Artisan', 'Other'
] as const;

export const updateProfileSchema = z.object({
  age: z.number().int().min(0).max(120),
  income: z.number().nonnegative(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  state: z.enum(INDIAN_STATES),
  occupation: z.enum(OCCUPATIONS),
});

export const updateProfileRouteSchema = z.object({
  body: updateProfileSchema,
});
