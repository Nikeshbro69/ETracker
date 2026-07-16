import prisma from "../../config/db.js";

export async function listIncomeCategories() {
  return prisma.incomeCategory.findMany({
    where: { deleted_at: null, is_active: true },
    orderBy: { name: "asc" },
  });
}

export async function listExpenseCategories() {
  return prisma.expenseCategory.findMany({
    where: { deleted_at: null, is_active: true },
    orderBy: { group_name: "asc" },
  });
}
