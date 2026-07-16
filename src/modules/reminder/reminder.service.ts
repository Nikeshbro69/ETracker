import prisma from "../../config/db.js";
import { AppError } from "../../utils/response.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import { AUDIT_ACTIONS } from "../../config/constants.js";
import { writeAuditLog } from "../../services/audit.service.js";
import type { z } from "zod";
import type { createReminderSchema, updateReminderSchema, listReminderSchema } from "./reminder.validation.js";
import type { Prisma } from "../../../generated/prisma/client.js";

type CreateInput = z.infer<typeof createReminderSchema>;
type UpdateInput = z.infer<typeof updateReminderSchema>;
type ListQuery = z.infer<typeof listReminderSchema>;

export async function createReminder(input: CreateInput, userId: string) {
  const reminder = await prisma.reminder.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      reminder_date: new Date(input.reminder_date),
      reminder_time: input.reminder_time ?? null,
      priority: input.priority,
      status: input.status,
      repeat: input.repeat,
      created_by: userId,
    },
  });
  await writeAuditLog({ userId, action: AUDIT_ACTIONS.REMINDER_CREATED, entityType: "reminder", entityId: reminder.id, newValues: reminder as unknown as Record<string, unknown> });
  return reminder;
}

export async function listReminders(query: ListQuery, userId: string) {
  const { page, limit, skip } = parsePagination(query.page, query.limit);
  const where: Prisma.ReminderWhereInput = { deleted_at: null, created_by: userId };

  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.from || query.to) {
    where.reminder_date = {};
    if (query.from) (where.reminder_date as Prisma.DateTimeFilter).gte = new Date(query.from);
    if (query.to) (where.reminder_date as Prisma.DateTimeFilter).lte = new Date(query.to);
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.reminder.findMany({ where, orderBy: [{ reminder_date: "asc" }, { priority: "desc" }], skip, take: limit }),
    prisma.reminder.count({ where }),
  ]);
  return { data, meta: buildMeta(page, limit, total) };
}

export async function getReminderById(id: string, userId: string) {
  const reminder = await prisma.reminder.findFirst({
    where: { id, deleted_at: null, created_by: userId },
    include: { attachments: { where: { deleted_at: null } } },
  });
  if (!reminder) throw new AppError("Reminder not found", 404);
  return reminder;
}

export async function updateReminder(id: string, input: UpdateInput, userId: string) {
  const existing = await prisma.reminder.findFirst({ where: { id, deleted_at: null, created_by: userId } });
  if (!existing) throw new AppError("Reminder not found", 404);

  const updated = await prisma.reminder.update({
    where: { id },
    data: {
      ...(input.title && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.reminder_date && { reminder_date: new Date(input.reminder_date) }),
      ...(input.reminder_time !== undefined && { reminder_time: input.reminder_time }),
      ...(input.priority && { priority: input.priority }),
      ...(input.status && { status: input.status }),
      ...(input.repeat && { repeat: input.repeat }),
    },
  });
  return updated;
}

export async function deleteReminder(id: string, userId: string) {
  const existing = await prisma.reminder.findFirst({ where: { id, deleted_at: null, created_by: userId } });
  if (!existing) throw new AppError("Reminder not found", 404);
  await prisma.reminder.update({ where: { id }, data: { deleted_at: new Date() } });
  await writeAuditLog({ userId, action: AUDIT_ACTIONS.REMINDER_DELETED, entityType: "reminder", entityId: id });
}

export async function completeReminder(id: string, userId: string) {
  const existing = await prisma.reminder.findFirst({ where: { id, deleted_at: null, created_by: userId } });
  if (!existing) throw new AppError("Reminder not found", 404);
  const updated = await prisma.reminder.update({ where: { id }, data: { status: "COMPLETED" } });
  await writeAuditLog({ userId, action: AUDIT_ACTIONS.REMINDER_COMPLETED, entityType: "reminder", entityId: id });
  return updated;
}
