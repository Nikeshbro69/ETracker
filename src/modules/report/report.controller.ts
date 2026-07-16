import type { Request, Response, NextFunction } from "express";
import {
  getIncomeReport,
  getExpenseReport,
  getProfitLossReport,
  getMonthlySummary,
  logReportExport,
  type ReportFilters,
} from "./report.service.js";
import { sendSuccess } from "../../utils/response.js";

function parseFilters(query: Record<string, unknown>): ReportFilters {
  return {
    from: query.from ? new Date(query.from as string) : undefined,
    to: query.to ? new Date(query.to as string) : undefined,
    category_id: query.category_id as string | undefined,
    payment_method: query.payment_method as string | undefined,
  };
}

export async function incomeReport(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = parseFilters(req.query as Record<string, unknown>);
    const result = await getIncomeReport(filters, req.user!.userId);
    if (req.query.format && req.query.format !== "json") {
      await logReportExport(req.user!.userId, "income", req.query.format as string);
    }
    return sendSuccess(res, result);
  } catch (err) { next(err); }
}

export async function expenseReport(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = parseFilters(req.query as Record<string, unknown>);
    const result = await getExpenseReport(filters, req.user!.userId);
    if (req.query.format && req.query.format !== "json") {
      await logReportExport(req.user!.userId, "expense", req.query.format as string);
    }
    return sendSuccess(res, result);
  } catch (err) { next(err); }
}

export async function profitLossReport(req: Request, res: Response, next: NextFunction) {
  try {
    const filters = parseFilters(req.query as Record<string, unknown>);
    const groupBy = (req.query.group_by as string) ?? "monthly";
    const result = await getProfitLossReport(filters, groupBy, req.user!.userId);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
}

export async function monthlySummaryReport(req: Request, res: Response, next: NextFunction) {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const result = await getMonthlySummary(year, req.user!.userId);
    return sendSuccess(res, result);
  } catch (err) { next(err); }
}
