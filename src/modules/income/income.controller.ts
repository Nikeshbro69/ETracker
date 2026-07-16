import type { Request, Response, NextFunction } from "express";
import {
  createIncomeSchema,
  updateIncomeSchema,
  listIncomeSchema,
} from "./income.validation.js";
import {
  createIncome,
  listIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
} from "./income.service.js";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response.js";

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const input = createIncomeSchema.parse(req.body);
    const data = await createIncome(input, req.user!.userId);
    return sendCreated(res, data);
  } catch (err) { next(err); }
}

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listIncomeSchema.parse(req.query);
    const { data, meta } = await listIncome(query, req.user!.userId);
    return sendSuccess(res, data, 200, meta);
  } catch (err) { next(err); }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getIncomeById(req.params.id, req.user!.userId);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const input = updateIncomeSchema.parse(req.body);
    const data = await updateIncome(req.params.id, input, req.user!.userId);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteIncome(req.params.id, req.user!.userId);
    return sendNoContent(res);
  } catch (err) { next(err); }
}
