import { z } from "zod";
import { REMINDER_PRIORITIES, REMINDER_STATUSES, REMINDER_REPEATS } from "../../config/constants.js";

export const createReminderSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional().nullable(),
  reminder_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reminder_time: z.string().optional().nullable(),
  priority: z.enum(REMINDER_PRIORITIES).default("MEDIUM"),
  status: z.enum(REMINDER_STATUSES).default("PENDING"),
  repeat: z.enum(REMINDER_REPEATS).default("NONE"),
});

export const updateReminderSchema = createReminderSchema.partial();

export const listReminderSchema = z.object({
  status: z.enum(REMINDER_STATUSES).optional(),
  priority: z.enum(REMINDER_PRIORITIES).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});
