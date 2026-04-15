import { z } from 'zod';

/* ─── Emotion tags ─────────────────────────────────────────────────────────── */

export const EMOTION_TAGS = [
  'restless',
  'tender',
  'grief',
  'longing',
  'wonder',
] as const;

export const EmotionTagSchema = z.enum(EMOTION_TAGS);
export type EmotionTag = z.infer<typeof EmotionTagSchema>;

/* ─── Fragment content ─────────────────────────────────────────────────────── */

export const FragmentContentSchema = z.object({
  text: z.string().max(2000).nullable(),
  imageUrl: z.string().url().nullable(),
});
export type FragmentContent = z.infer<typeof FragmentContentSchema>;

/* ─── Analysis (from Claude Call 1) ───────────────────────────────────────── */

export const FragmentAnalysisSchema = z.object({
  emotion: z.string().min(1).max(60),
  theme: z.string().min(1).max(120),
  perspectiveSignal: z.string().min(1).max(200),
});
export type FragmentAnalysis = z.infer<typeof FragmentAnalysisSchema>;

/* ─── Response ─────────────────────────────────────────────────────────────── */

export const ResponseSchema = z.object({
  id: z.string().startsWith('rsp_'),
  createdAt: z.string().datetime(),
  text: z.string().min(1).max(1000),
});
export type Response = z.infer<typeof ResponseSchema>;

/* ─── Fragment ─────────────────────────────────────────────────────────────── */

export const FragmentKindSchema = z.enum(['text', 'image', 'mixed']);
export type FragmentKind = z.infer<typeof FragmentKindSchema>;

export const FragmentSchema = z.object({
  id: z.string().startsWith('frg_'),
  createdAt: z.string().datetime(),
  kind: FragmentKindSchema,
  content: FragmentContentSchema,
  userTag: EmotionTagSchema,
  analysis: FragmentAnalysisSchema.nullable(),
  matchedWith: z.string().startsWith('frg_').nullable(),
  responses: z.array(ResponseSchema),
});
export type Fragment = z.infer<typeof FragmentSchema>;

/* ─── Full DB store ────────────────────────────────────────────────────────── */

export const StoreMeta = z.object({
  version: z.literal(1),
  lastWriteAt: z.string().datetime(),
});

export const FragmentStoreSchema = z.object({
  fragments: z.array(FragmentSchema),
  meta: StoreMeta,
});
export type FragmentStore = z.infer<typeof FragmentStoreSchema>;

/* ─── Drop input (from client → POST /api/fragments) ──────────────────────── */

export const DropInputSchema = z.object({
  text: z.string().min(1, 'Fragment text is required').max(2000).nullable(),
  imageDataUrl: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp|gif);base64,/, 'Invalid image format')
    .nullable(),
  userTag: EmotionTagSchema,
}).refine(
  (d) => d.text !== null || d.imageDataUrl !== null,
  { message: 'A fragment must have text or an image' },
);
export type DropInput = z.infer<typeof DropInputSchema>;

/* ─── Response input (from client → POST /api/responses) ──────────────────── */

export const ResponseInputSchema = z.object({
  fragmentId: z.string().startsWith('frg_'),
  text: z.string().min(1, 'Response cannot be empty').max(1000),
});
export type ResponseInput = z.infer<typeof ResponseInputSchema>;
