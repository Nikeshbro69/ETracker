import type { Request, Response, NextFunction } from "express";
import { createNoteSchema, updateNoteSchema, listNoteSchema } from "./note.validation.js";
import { createNote, listNotes, getNoteById, updateNote, deleteNote, togglePin, toggleArchive } from "./note.service.js";
import { sendSuccess, sendCreated, sendNoContent } from "../../utils/response.js";

export async function create(req: Request, res: Response, next: NextFunction) {
  try { return sendCreated(res, await createNote(createNoteSchema.parse(req.body), req.user!.userId)); } catch (err) { next(err); }
}
export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listNoteSchema.parse(req.query);
    const { data, meta } = await listNotes(query, req.user!.userId);
    return sendSuccess(res, data, 200, meta);
  } catch (err) { next(err); }
}
export async function getOne(req: Request, res: Response, next: NextFunction) {
  try { return sendSuccess(res, await getNoteById(req.params.id, req.user!.userId)); } catch (err) { next(err); }
}
export async function update(req: Request, res: Response, next: NextFunction) {
  try { return sendSuccess(res, await updateNote(req.params.id, updateNoteSchema.parse(req.body), req.user!.userId)); } catch (err) { next(err); }
}
export async function remove(req: Request, res: Response, next: NextFunction) {
  try { await deleteNote(req.params.id, req.user!.userId); return sendNoContent(res); } catch (err) { next(err); }
}
export async function pin(req: Request, res: Response, next: NextFunction) {
  try { return sendSuccess(res, await togglePin(req.params.id, req.user!.userId)); } catch (err) { next(err); }
}
export async function archive(req: Request, res: Response, next: NextFunction) {
  try { return sendSuccess(res, await toggleArchive(req.params.id, req.user!.userId)); } catch (err) { next(err); }
}
