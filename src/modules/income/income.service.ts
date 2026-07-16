import prisma from "../../config/db.js";
import { AppError } from "../../utils/response.js";
import { parsePagination, buildMeta } from "../../utils/pagination.js";
import { isFutureDate } from "../../utils/dateHelpers.js";
import { AUDIT_ACTIONS } from "../../config/constants.js";
import { writeAuditLog } from "../../services/audit.service.js";
import type {
  CreateIncomeInput,
  UpdateIncomeInput,
  ListIncomeQuery,
} from "./income.validation.js";
import type { Prisma } from "../../../generated/prisma/client.js";

export async function createIncome(input: CreateIncomeInput, userId: string) {
  const date = new Date(input.transaction_date);
  if (isFutureDate(date)) {
    throw new AppError("Transaction date cannot be in the future", 422);
  }

  const category = await prisma.incomeCategory.findFirst({
    where: { id: input.income_category_id, deleted_at: null },
  });
  if (!category) throw new AppError("Income category not found", 404);

  const income = await prisma.income.create({
    data: {
      transaction_date: date,
      amount: input.amount,
      income_category_id: input.income_category_id,
      income_source: input.income_source ?? null,
      client_name: input.client_name ?? null,
      payment_method: input.payment_method,
      reference_number: input.reference_number ?? null,
      invoice_number: input.invoice_number ?? null,
      description: input.description ?? null,
      created_by: userId,
    },
    include: { category: true },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.INCOME_CREATED,
    entityType: "income",
    entityId: income.id,
    newValues: income as unknown as Record<string, unknown>,
  });

  return income;
}

export async function listIncome(query: ListIncomeQuery, userId: string) {
  const { page, limit, skip } = parsePagination(query.page, query.limit);

  const where: Prisma.IncomeWhereInput = {
    deleted_at: null,
    created_by: userId,
  };

  if (query.from || query.to) {
    where.transaction_date = {};
    if (query.from) (where.transaction_date as Prisma.DateTimeFilter).gte = new Date(query.from);
    if (query.to) (where.transaction_date as Prisma.DateTimeFilter).lte = new Date(query.to);
  }
  if (query.category_id) where.income_category_id = query.category_id;
  if (query.payment_method) where.payment_method = query.payment_method;
  if (query.amount_min || query.amount_max) {
    where.amount = {};
    if (query.amount_min) (where.amount as Prisma.DecimalFilter).gte = Number(query.amount_min);
    if (query.amount_max) (where.amount as Prisma.DecimalFilter).lte = Number(query.amount_max);
  }
  if (query.client_name) {
    where.client_name = { contains: query.client_name, mode: "insensitive" };
  }
  if (query.search) {
    where.OR = [
      { description: { contains: query.search, mode: "insensitive" } },
      { client_name: { contains: query.search, mode: "insensitive" } },
      { reference_number: { contains: query.search, mode: "insensitive" } },
      { invoice_number: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.income.findMany({
      where,
      include: { category: true },
      orderBy: { transaction_date: "desc" },
      skip,
      take: limit,
    }),
    prisma.income.count({ where }),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
}

export async function getIncomeById(id: string, userId: string) {
  const income = await prisma.income.findFirst({
    where: { id, deleted_at: null, created_by: userId },
    include: {
      category: true,
      attachments: { where: { deleted_at: null } },
    },
  });
  if (!income) throw new AppError("Income record not found", 404);
  return income;
}

export async function updateIncome(
  id: string,
  input: UpdateIncomeInput,
  userId: string
) {
  const existing = await prisma.income.findFirst({
    where: { id, deleted_at: null, created_by: userId },
  });
  if (!existing) throw new AppError("Income record not found", 404);

  if (input.transaction_date) {
    const date = new Date(input.transaction_date);
    if (isFutureDate(date)) {
      throw new AppError("Transaction date cannot be in the future", 422);
    }
  }

  if (input.income_category_id) {
    const category = await prisma.incomeCategory.findFirst({
      where: { id: input.income_category_id, deleted_at: null },
    });
    if (!category) throw new AppError("Income category not found", 404);
  }

  const updated = await prisma.income.update({
    where: { id },
    data: {
      ...(input.transaction_date && {
        transaction_date: new Date(input.transaction_date),
      }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.income_category_id && {
        income_category_id: input.income_category_id,
      }),
      ...(input.income_source !== undefined && {
        income_source: input.income_source,
      }),
      ...(input.client_name !== undefined && { client_name: input.client_name }),
      ...(input.payment_method && { payment_method: input.payment_method }),
      ...(input.reference_number !== undefined && {
        reference_number: input.reference_number,
      }),
      ...(input.invoice_number !== undefined && {
        invoice_number: input.invoice_number,
      }),
      ...(input.description !== undefined && { description: input.description }),
      updated_by: userId,
    },
    include: { category: true },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.INCOME_UPDATED,
    entityType: "income",
    entityId: id,
    oldValues: existing as unknown as Record<string, unknown>,
    newValues: updated as unknown as Record<string, unknown>,
  });

  return updated;
}

export async function deleteIncome(id: string, userId: string) {
  const existing = await prisma.income.findFirst({
    where: { id, deleted_at: null, created_by: userId },
  });
  if (!existing) throw new AppError("Income record not found", 404);

  await prisma.income.update({
    where: { id },
    data: { deleted_at: new Date(), updated_by: userId },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.INCOME_DELETED,
    entityType: "income",
    entityId: id,
    oldValues: existing as unknown as Record<string, unknown>,
  });
}
