import prisma from "../../config/db.js";
import { writeAuditLog } from "../../services/audit.service.js";
import { AUDIT_ACTIONS } from "../../config/constants.js";

export interface ReportFilters {
  from?: Date;
  to?: Date;
  category_id?: string;
  payment_method?: string;
}

export async function getIncomeReport(filters: ReportFilters, userId: string) {
  const where: Record<string, unknown> = { created_by: userId, deleted_at: null };
  if (filters.from || filters.to) {
    where.transaction_date = {};
    if (filters.from) (where.transaction_date as Record<string, unknown>).gte = filters.from;
    if (filters.to) (where.transaction_date as Record<string, unknown>).lte = filters.to;
  }
  if (filters.category_id) where.income_category_id = filters.category_id;
  if (filters.payment_method) where.payment_method = filters.payment_method;

  const data = await prisma.income.findMany({
    where,
    include: { category: true },
    orderBy: { transaction_date: "desc" },
  });

  const total = data.reduce((s, r) => s + Number(r.amount), 0);
  return { data, total };
}

export async function getExpenseReport(filters: ReportFilters, userId: string) {
  const where: Record<string, unknown> = { created_by: userId, deleted_at: null };
  if (filters.from || filters.to) {
    where.expense_date = {};
    if (filters.from) (where.expense_date as Record<string, unknown>).gte = filters.from;
    if (filters.to) (where.expense_date as Record<string, unknown>).lte = filters.to;
  }
  if (filters.category_id) where.expense_category_id = filters.category_id;
  if (filters.payment_method) where.payment_method = filters.payment_method;

  const data = await prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { expense_date: "desc" },
  });

  const total = data.reduce((s, r) => s + Number(r.amount), 0);
  return { data, total };
}

export async function getProfitLossReport(
  filters: ReportFilters,
  groupBy: string,
  userId: string
) {
  const { data: incomes } = await getIncomeReport(filters, userId);
  const { data: expenses } = await getExpenseReport(filters, userId);

  const totalIncome = incomes.reduce((s, r) => s + Number(r.amount), 0);
  const totalExpense = expenses.reduce((s, r) => s + Number(r.amount), 0);

  return {
    total_income: totalIncome,
    total_expense: totalExpense,
    net_profit: totalIncome - totalExpense,
    group_by: groupBy,
  };
}

export async function getMonthlySummary(year: number, userId: string) {
  const months = Array.from({ length: 12 }, (_, i) => i);

  const rows = await Promise.all(
    months.map(async (month) => {
      const from = new Date(Date.UTC(year, month, 1));
      const to = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

      const [incomeRes, expenseRes] = await Promise.all([
        prisma.income.aggregate({
          _sum: { amount: true },
          where: { created_by: userId, deleted_at: null, transaction_date: { gte: from, lte: to } },
        }),
        prisma.expense.aggregate({
          _sum: { amount: true },
          where: { created_by: userId, deleted_at: null, expense_date: { gte: from, lte: to } },
        }),
      ]);

      const income = Number(incomeRes._sum.amount ?? 0);
      const expense = Number(expenseRes._sum.amount ?? 0);
      return {
        month: from.toLocaleString("default", { month: "long" }),
        month_num: month + 1,
        income,
        expense,
        net_profit: income - expense,
      };
    })
  );

  return { year, months: rows };
}

export async function logReportExport(userId: string, reportType: string, format: string) {
  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.REPORT_EXPORTED,
    entityType: "report",
    newValues: { reportType, format },
  });
}
