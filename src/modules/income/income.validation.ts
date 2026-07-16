import { z } from "zod";
import { PAYMENT_METHODS } from "../../config/constants.js";

export const createIncomeSchema = z.object({
  transaction_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  amount: z.number().positive("Amount must be greater than 0"),
  income_category_id: z.string().uuid("Invalid category ID"),
  income_source: z.string().max(255).optional().nullable(),
  client_name: z.string().max(255).optional().nullable(),
  payment_method: z.enum(PAYMENT_METHODS),
  reference_number: z.string().max(255).optional().nullable(),
  invoice_number: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export const listIncomeSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  category_id: z.string().uuid().optional(),
  payment_method: z.string().optional(),
  amount_min: z.string().optional(),
  amount_max: z.string().optional(),
  client_name: z.string().optional(),
  search: z.string().optional(),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
export type ListIncomeQuery = z.infer<typeof listIncomeSchema>;
