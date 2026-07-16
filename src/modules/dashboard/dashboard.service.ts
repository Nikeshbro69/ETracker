import prisma from "../../config/db.js";
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
} from "../../utils/dateHelpers.js";

async function sumIncome(from: Date, to: Date, userId: string): Promise<number> {
  const result = await prisma.income.aggregate({
    _sum: { amount: true },
    where: { created_by: userId, deleted_at: null, transaction_date: { gte: from, lte: to } },
  });
  return Number(result._sum.amount ?? 0);
}

async function sumExpense(from: Date, to: Date, userId: string): Promise<number> {
  const result = await prisma.expense.aggregate({
    _sum: { amount: true },
    where: { created_by: userId, deleted_at: null, expense_date: { gte: from, lte: to } },
  });
  return Number(result._sum.amount ?? 0);
}

export async function getKPIs(userId: string) {
  const now = new Date();

  const periods = {
    today: { from: startOfDay(now), to: endOfDay(now) },
    week: { from: startOfWeek(now), to: endOfWeek(now) },
    month: { from: startOfMonth(now), to: endOfMonth(now) },
    year: { from: startOfYear(now), to: endOfYear(now) },
  };

  const results = await Promise.all(
    (Object.entries(periods) as [string, { from: Date; to: Date }][]).map(
      async ([key, { from, to }]) => {
        const [income, expense] = await Promise.all([
          sumIncome(from, to, userId),
          sumExpense(from, to, userId),
        ]);
        return { key, income, expense, profit: income - expense };
      }
    )
  );

  return results.reduce((acc, { key, income, expense, profit }) => {
    acc[key] = { income, expense, profit };
    return acc;
  }, {} as Record<string, { income: number; expense: number; profit: number }>);
}

export async function getIncomeVsExpenseChart(period: string, userId: string) {
  const now = new Date();
  const year = now.getUTCFullYear();

  if (period === "daily") {
    // Last 30 days
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - (29 - i));
      return d;
    });
    return Promise.all(
      days.map(async (d) => {
        const from = startOfDay(d);
        const to = endOfDay(d);
        const [income, expense] = await Promise.all([
          sumIncome(from, to, userId),
          sumExpense(from, to, userId),
        ]);
        return { label: from.toISOString().split("T")[0], income, expense, profit: income - expense };
      })
    );
  }

  if (period === "weekly") {
    // Last 12 weeks
    return Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const d = new Date();
        d.setUTCDate(d.getUTCDate() - (11 - i) * 7);
        const from = startOfWeek(d);
        const to = endOfWeek(d);
        const [income, expense] = await Promise.all([
          sumIncome(from, to, userId),
          sumExpense(from, to, userId),
        ]);
        return { label: `W${from.toISOString().split("T")[0]}`, income, expense, profit: income - expense };
      })
    );
  }

  if (period === "yearly") {
    return Promise.all(
      Array.from({ length: 5 }, async (_, i) => {
        const y = year - 4 + i;
        const from = new Date(Date.UTC(y, 0, 1));
        const to = new Date(Date.UTC(y, 11, 31, 23, 59, 59));
        const [income, expense] = await Promise.all([
          sumIncome(from, to, userId),
          sumExpense(from, to, userId),
        ]);
        return { label: String(y), income, expense, profit: income - expense };
      })
    );
  }

  // Default: monthly for current year
  return Promise.all(
    Array.from({ length: 12 }, async (_, month) => {
      const from = new Date(Date.UTC(year, month, 1));
      const to = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
      const [income, expense] = await Promise.all([
        sumIncome(from, to, userId),
        sumExpense(from, to, userId),
      ]);
      const label = from.toLocaleString("default", { month: "short" });
      return { label, income, expense, profit: income - expense };
    })
  );
}

export async function getIncomeByCategoryChart(from: Date, to: Date, userId: string) {
  const results = await prisma.income.groupBy({
    by: ["income_category_id"],
    _sum: { amount: true },
    where: { created_by: userId, deleted_at: null, transaction_date: { gte: from, lte: to } },
  });

  const categories = await prisma.incomeCategory.findMany({ where: { is_active: true } });
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const total = results.reduce((s, r) => s + Number(r._sum.amount ?? 0), 0);
  return results.map((r) => ({
    category: catMap.get(r.income_category_id) ?? "Unknown",
    amount: Number(r._sum.amount ?? 0),
    percentage: total > 0 ? Math.round((Number(r._sum.amount ?? 0) / total) * 100) : 0,
  }));
}

export async function getExpenseByCategoryChart(from: Date, to: Date, userId: string) {
  const results = await prisma.expense.groupBy({
    by: ["expense_category_id"],
    _sum: { amount: true },
    where: { created_by: userId, deleted_at: null, expense_date: { gte: from, lte: to } },
  });

  const categories = await prisma.expenseCategory.findMany({ where: { is_active: true } });
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  const total = results.reduce((s, r) => s + Number(r._sum.amount ?? 0), 0);
  return results.map((r) => ({
    category: catMap.get(r.expense_category_id) ?? "Unknown",
    amount: Number(r._sum.amount ?? 0),
    percentage: total > 0 ? Math.round((Number(r._sum.amount ?? 0) / total) * 100) : 0,
  }));
}

export async function getRecentTransactions(userId: string) {
  const [incomes, expenses] = await Promise.all([
    prisma.income.findMany({
      where: { created_by: userId, deleted_at: null },
      include: { category: true },
      orderBy: { transaction_date: "desc" },
      take: 20,
    }),
    prisma.expense.findMany({
      where: { created_by: userId, deleted_at: null },
      include: { category: true },
      orderBy: { expense_date: "desc" },
      take: 20,
    }),
  ]);

  const combined = [
    ...incomes.map((i) => ({ ...i, type: "income", date: i.transaction_date })),
    ...expenses.map((e) => ({ ...e, type: "expense", date: e.expense_date })),
  ];

  return combined
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 20);
}

export async function getUpcomingReminders(userId: string) {
  const now = new Date();
  const in7Days = new Date();
  in7Days.setDate(now.getDate() + 7);

  return prisma.reminder.findMany({
    where: {
      created_by: userId,
      deleted_at: null,
      status: "PENDING",
      reminder_date: { gte: now, lte: in7Days },
    },
    orderBy: [{ reminder_date: "asc" }, { priority: "desc" }],
  });
}
