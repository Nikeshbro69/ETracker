import type { Request, Response, NextFunction } from "express";
import { createExpenseSchema, updateExpenseSchema, listExpenseSchema } from "./expense.validation.js";
import { createExpense, listExpense, getExpenseById, updateExpense, deleteExpense } from "./expense.service.js";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response.js";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createExpenseSchema.parse(req.body);
    return sendCreated(res, await createExpense(input, req.user!.userId));
  } catch (err) { next(err); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listExpenseSchema.parse(req.query);
    const { data, meta } = await listExpense(query, req.user!.userId);
    return sendSuccess(res, data, 200, meta);
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, await getExpenseById(req.params.id, req.user!.userId));
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateExpenseSchema.parse(req.body);
    return sendSuccess(res, await updateExpense(req.params.id, input, req.user!.userId));
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteExpense(req.params.id, req.user!.userId);
    return sendNoContent(res);
  } catch (err) { next(err); }
}
