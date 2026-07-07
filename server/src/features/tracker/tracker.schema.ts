import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const upsertTrackSchema = z.object({
  body: z.object({
    schemeId: z.string().regex(objectIdRegex, 'Invalid scheme ID format'),
    status: z.enum(['INTERESTED', 'APPLIED', 'APPROVED', 'REJECTED']),
    notes: z.string().optional(),
  })
});

export const deleteTrackSchema = z.object({
  params: z.object({
    schemeId: z.string().regex(objectIdRegex, 'Invalid scheme ID format'),
  })
});
