import { z } from "zod";
import { PAYMENT_METHODS } from "../../config/constants.js";

export const createExpenseSchema = z.object({
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  amount: z.number().positive("Amount must be greater than 0"),
  expense_category_id: z.string().uuid("Invalid category ID"),
  vendor_name: z.string().max(255).optional().nullable(),
  payment_method: z.enum(PAYMENT_METHODS),
  bill_number: z.string().max(255).optional().nullable(),
  description: z.string().optional().nullable(),
});

export const updateExpenseSchema = createExpenseSchema.partial();

export const listExpenseSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  category_id: z.string().uuid().optional(),
  payment_method: z.string().optional(),
  amount_min: z.string().optional(),
  amount_max: z.string().optional(),
  vendor_name: z.string().optional(),
  search: z.string().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ListExpenseQuery = z.infer<typeof listExpenseSchema>;
