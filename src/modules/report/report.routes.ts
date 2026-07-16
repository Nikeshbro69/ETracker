import { Router } from "express";
import { incomeReport, expenseReport, profitLossReport, monthlySummaryReport } from "./report.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();
router.use(authGuard);

router.get("/income", incomeReport);
router.get("/expense", expenseReport);
router.get("/profit-loss", profitLossReport);
router.get("/monthly-summary", monthlySummaryReport);

export default router;
