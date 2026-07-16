import type { Request, Response, NextFunction } from "express";
import { createReminderSchema, updateReminderSchema, listReminderSchema } from "./reminder.validation.js";
import { createReminder, listReminders, getReminderById, updateReminder, deleteReminder, completeReminder } from "./reminder.service.js";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response.js";

export async function create(req: Request, res: Response, next: NextFunction) {
  try { return sendCreated(res, await createReminder(createReminderSchema.parse(req.body), req.user!.userId)); } catch (err) { next(err); }
}
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listReminderSchema.parse(req.query);
    const { data, meta } = await listReminders(query, req.user!.userId);
    return sendSuccess(res, data, 200, meta);
  } catch (err) { next(err); }
}
export async function getOne(req: Request, res: Response, next: NextFunction) {
  try { return sendSuccess(res, await getReminderById(req.params.id, req.user!.userId)); } catch (err) { next(err); }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try { return sendSuccess(res, await updateReminder(req.params.id, updateReminderSchema.parse(req.body), req.user!.userId)); } catch (err) { next(err); }
}
export async function remove(req: Request, res: Response, next: NextFunction) {
  try { await deleteReminder(req.params.id, req.user!.userId); return sendNoContent(res); } catch (err) { next(err); }
}
export async function complete(req: Request, res: Response, next: NextFunction) {
  try { return sendSuccess(res, await completeReminder(req.params.id, req.user!.userId)); } catch (err) { next(err); }
}
