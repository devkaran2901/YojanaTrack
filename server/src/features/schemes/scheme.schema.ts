import { z } from 'zod';

export const schemeQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  state: z.string().optional(),
  gender: z.string().optional(),
  minAge: z.string().optional(),
  maxIncome: z.string().optional(),
});

export const matchEligibilitySchema = z.object({
  age: z.number().min(0).max(120),
  income: z.number().nonnegative(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'ALL']),
  state: z.string().min(1),
  occupation: z.string().min(1),
});

export const createSchemeSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  state: z.string().nullable().optional(),
  minAge: z.number().int().nonnegative().nullable().optional(),
  maxAge: z.number().int().nonnegative().nullable().optional(),
  maxIncome: z.number().int().nonnegative().nullable().optional(),
  gender: z.string().nullable().optional(),
  occupation: z.string().nullable().optional(),
  benefits: z.string().min(5, 'Benefits details must be at least 5 characters'),
  documentsRequired: z.array(z.string()).min(1, 'At least one document is required'),
  applicationUrl: z.string().url('Invalid URL').nullable().optional().or(z.literal('')),
  ministry: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  verifiedAt: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable().optional()),
  deadline: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable().optional()),
});

export const updateSchemeSchema = createSchemeSchema.partial();

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Route-level schemas (validating entire request object)
export const schemeQueryRouteSchema = z.object({
  query: schemeQuerySchema,
});

export const matchEligibilityRouteSchema = z.object({
  body: matchEligibilitySchema,
});

export const createSchemeRouteSchema = z.object({
  body: createSchemeSchema,
});

export const updateSchemeRouteSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid scheme ID format'),
  }),
  body: updateSchemeSchema,
});

export const deleteSchemeRouteSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, 'Invalid scheme ID format'),
  }),
});

export const getSchemeBySlugRouteSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
});

