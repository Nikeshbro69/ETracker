import prisma from "../../config/db.js";
import { AppError } from "../../utils/response.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import { isFutureDate } from "../../utils/dateHelpers.js";
import { AUDIT_ACTIONS } from "../../config/constants.js";
import { writeAuditLog } from "../../services/audit.service.js";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ListExpenseQuery,
} from "./expense.validation.js";
import type { Prisma } from "../../../generated/prisma/client.js";

export async function createExpense(input: CreateExpenseInput, userId: string) {
  const date = new Date(input.expense_date);
  if (isFutureDate(date)) throw new AppError("Expense date cannot be in the future", 422);

  const category = await prisma.expenseCategory.findFirst({
    where: { id: input.expense_category_id, deleted_at: null },
  });
  if (!category) throw new AppError("Expense category not found", 404);

  const expense = await prisma.expense.create({
    data: {
      expense_date: date,
      amount: input.amount,
      expense_category_id: input.expense_category_id,
      vendor_name: input.vendor_name ?? null,
      payment_method: input.payment_method,
      bill_number: input.bill_number ?? null,
      description: input.description ?? null,
      created_by: userId,
    },
    include: { category: true },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.EXPENSE_CREATED,
    entityType: "expense",
    entityId: expense.id,
    newValues: expense as unknown as Record<string, unknown>,
  });

  return expense;
}

export async function listExpense(query: ListExpenseQuery, userId: string) {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Prisma.ExpenseWhereInput = {
    deleted_at: null,
    created_by: userId,
  };

  if (query.from || query.to) {
    where.expense_date = {};
    if (query.from) (where.expense_date as Prisma.DateTimeFilter).gte = new Date(query.from);
    if (query.to) (where.expense_date as Prisma.DateTimeFilter).lte = new Date(query.to);
  }
  if (query.category_id) where.expense_category_id = query.category_id;
  if (query.payment_method) where.payment_method = query.payment_method;
  if (query.amount_min || query.amount_max) {
    where.amount = {};
    if (query.amount_min) (where.amount as Prisma.DecimalFilter).gte = Number(query.amount_min);
    if (query.amount_max) (where.amount as Prisma.DecimalFilter).lte = Number(query.amount_max);
  }
  if (query.vendor_name) {
    where.vendor_name = { contains: query.vendor_name, mode: "insensitive" };
  }
  if (query.search) {
    where.OR = [
      { description: { contains: query.search, mode: "insensitive" } },
      { vendor_name: { contains: query.search, mode: "insensitive" } },
      { bill_number: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { expense_date: "desc" },
      skip,
      take: limit,
    }),
    prisma.expense.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
}

export async function getExpenseById(id: string, userId: string) {
  const expense = await prisma.expense.findFirst({
    where: { id, deleted_at: null, created_by: userId },
    include: {
      category: true,
      attachments: { where: { deleted_at: null } },
    },
  });
  if (!expense) throw new AppError("Expense record not found", 404);
  return expense;
}

export async function updateExpense(
  id: string,
  input: UpdateExpenseInput,
  userId: string
) {
  const existing = await prisma.expense.findFirst({
    where: { id, deleted_at: null, created_by: userId },
  });
  if (!existing) throw new AppError("Expense record not found", 404);

  if (input.expense_date) {
    const date = new Date(input.expense_date);
    if (isFutureDate(date)) throw new AppError("Expense date cannot be in the future", 422);
  }

  if (input.expense_category_id) {
    const cat = await prisma.expenseCategory.findFirst({
      where: { id: input.expense_category_id, deleted_at: null },
    });
    if (!cat) throw new AppError("Expense category not found", 404);
  }

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      ...(input.expense_date && { expense_date: new Date(input.expense_date) }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.expense_category_id && { expense_category_id: input.expense_category_id }),
      ...(input.vendor_name !== undefined && { vendor_name: input.vendor_name }),
      ...(input.payment_method && { payment_method: input.payment_method }),
      ...(input.bill_number !== undefined && { bill_number: input.bill_number }),
      ...(input.description !== undefined && { description: input.description }),
      updated_by: userId,
    },
    include: { category: true },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.EXPENSE_UPDATED,
    entityType: "expense",
    entityId: id,
    oldValues: existing as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

export async function deleteExpense(id: string, userId: string) {
  const existing = await prisma.expense.findFirst({
    where: { id, deleted_at: null, created_by: userId },
  });
  if (!existing) throw new AppError("Expense record not found", 404);

  await prisma.expense.update({
    where: { id },
    data: { deleted_at: new Date(), updated_by: userId },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.EXPENSE_DELETED,
    entityType: "expense",
    entityId: id,
    oldValues: existing as unknown as Record<string, unknown>,
  });
}
