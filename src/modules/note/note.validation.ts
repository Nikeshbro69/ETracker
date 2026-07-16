import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  color_label: z.string().max(50).optional().nullable(),
  is_pinned: z.boolean().optional(),
  is_archived: z.boolean().optional(),
});

export const updateNoteSchema = createNoteSchema.partial();

export const listNoteSchema = z.object({
  search: z.string().optional(),
  is_pinned: z.enum(["true", "false"]).optional(),
  is_archived: z.enum(["true", "false"]).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
