import prisma from "../../config/db.js";
import { AppError } from "../../utils/response.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import { AUDIT_ACTIONS } from "../../config/constants.js";
import { writeAuditLog } from "../../services/audit.service.js";
import type { CreateNoteInput, UpdateNoteInput } from "./note.validation.js";

export async function createNote(input: CreateNoteInput, userId: string) {
  const note = await prisma.note.create({
    data: {
      title: input.title,
      description: input.description,
      color_label: input.color_label ?? null,
      is_pinned: input.is_pinned ?? false,
      is_archived: input.is_archived ?? false,
      created_by: userId,
    },
  });
  await writeAuditLog({ userId, action: AUDIT_ACTIONS.NOTE_CREATED, entityType: "note", entityId: note.id, newValues: note as unknown as Record<string, unknown> });
  return note;
}

export async function listNotes(query: { search?: string; is_pinned?: string; is_archived?: string; page?: string; limit?: string }, userId: string) {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Record<string, unknown> = { deleted_at: null, created_by: userId };

  // By default, exclude archived unless explicitly requested
  if (query.is_archived === "true") {
    where.is_archived = true;
  } else if (query.is_archived === "false") {
    where.is_archived = false;
  } else {
    where.is_archived = false;
  }

  if (query.is_pinned !== undefined) {
    where.is_pinned = query.is_pinned === "true";
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.note.findMany({ where, orderBy: [{ is_pinned: "desc" }, { updated_at: "desc" }], skip, take: limit }),
    prisma.note.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
}

export async function getNoteById(id: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id, deleted_at: null, created_by: userId } });
  if (!note) throw new AppError("Note not found", 404);
  return note;
}

export async function updateNote(id: string, input: UpdateNoteInput, userId: string) {
  const existing = await prisma.note.findFirst({ where: { id, deleted_at: null, created_by: userId } });
  if (!existing) throw new AppError("Note not found", 404);

  const updated = await prisma.note.update({ where: { id }, data: { ...input } });
  await writeAuditLog({ userId, action: AUDIT_ACTIONS.NOTE_UPDATED, entityType: "note", entityId: id, oldValues: existing as unknown as Record<string, unknown>, newValues: updated as unknown as Record<string, unknown> });
  return updated;
}

export async function deleteNote(id: string, userId: string) {
  const existing = await prisma.note.findFirst({ where: { id, deleted_at: null, created_by: userId } });
  if (!existing) throw new AppError("Note not found", 404);
  await prisma.note.update({ where: { id }, data: { deleted_at: new Date() } });
  await writeAuditLog({ userId, action: AUDIT_ACTIONS.NOTE_DELETED, entityType: "note", entityId: id });
}

export async function togglePin(id: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id, deleted_at: null, created_by: userId } });
  if (!note) throw new AppError("Note not found", 404);
  return prisma.note.update({ where: { id }, data: { is_pinned: !note.is_pinned } });
}

export async function toggleArchive(id: string, userId: string) {
  const note = await prisma.note.findFirst({ where: { id, deleted_at: null, created_by: userId } });
  if (!note) throw new AppError("Note not found", 404);
  return prisma.note.update({ where: { id }, data: { is_archived: !note.is_archived } });
}
