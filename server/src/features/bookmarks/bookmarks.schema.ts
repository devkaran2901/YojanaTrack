import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const addBookmarkSchema = z.object({
  body: z.object({
    schemeId: z.string().regex(objectIdRegex, 'Invalid scheme ID format'),
  })
});

export const removeBookmarkSchema = z.object({
  params: z.object({
    schemeId: z.string().regex(objectIdRegex, 'Invalid scheme ID format'),
  })
});
