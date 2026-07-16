import type { Request, Response, NextFunction } from "express";
import { listIncomeCategories, listExpenseCategories } from "./category.service.js";
import { sendSuccess } from "../../utils/response.js";

export async function getIncomeCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, await listIncomeCategories());
  } catch (err) { next(err); }
}

export async function getExpenseCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, await listExpenseCategories());
  } catch (err) { next(err); }
}
