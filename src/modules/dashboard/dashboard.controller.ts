import type { Request, Response, NextFunction } from "express";
import {
  getKPIs,
  getIncomeVsExpenseChart,
  getIncomeByCategoryChart,
  getExpenseByCategoryChart,
  getRecentTransactions,
  getUpcomingReminders,
} from "./dashboard.service.js";
import { sendSuccess } from "../../utils/response.js";

export async function kpis(req: Request, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, await getKPIs(req.user!.userId));
  } catch (err) { next(err); }
}

export async function incomeVsExpense(req: Request, res: Response, next: NextFunction) {
  try {
    const period = (req.query.period as string) ?? "monthly";
    return sendSuccess(res, await getIncomeVsExpenseChart(period, req.user!.userId));
  } catch (err) { next(err); }
}

export async function incomeByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(new Date().getFullYear(), 0, 1);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();
    return sendSuccess(res, await getIncomeByCategoryChart(from, to, req.user!.userId));
  } catch (err) { next(err); }
}

export async function expenseByCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(new Date().getFullYear(), 0, 1);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();
    return sendSuccess(res, await getExpenseByCategoryChart(from, to, req.user!.userId));
  } catch (err) { next(err); }
}

export async function recentTransactions(req: Request, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, await getRecentTransactions(req.user!.userId));
  } catch (err) { next(err); }
}

export async function upcomingReminders(req: Request, res: Response, next: NextFunction) {
  try {
    return sendSuccess(res, await getUpcomingReminders(req.user!.userId));
  } catch (err) { next(err); }
}
