import { z } from 'zod';

export const fillRequestSchema = z.object({
  pdfId: z.string().uuid(),
  values: z.record(z.union([z.string(), z.boolean()])),
  flatten: z.boolean().optional().default(true),
});

export const schemaUpdateSchema = z.object({
  fields: z.array(z.object({
    name: z.string(),
    label: z.string().max(200),
    type: z.enum(['text', 'textarea', 'checkbox', 'radio', 'select', 'date']),
    required: z.boolean(),
    options: z.array(z.object({
      value: z.string(),
      label: z.string().max(200),
    })).optional(),
    defaultValue: z.union([z.string().max(1000), z.boolean()]).optional(),
    group: z.string().optional(),
    order: z.number().int().min(0),
  })),
  meta: z.object({
    title: z.string().max(500).optional(),
    author: z.string().max(500).optional(),
    pageCount: z.number().int().min(0),
    created: z.string(),
    modified: z.string(),
  }).optional(),
});

export function sanitizeString(value: string, maxLength = 10000): string {
  return value
    .slice(0, maxLength)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
}

