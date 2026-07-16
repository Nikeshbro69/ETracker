import { Router } from "express";
import { kpis, incomeVsExpense, incomeByCategory, expenseByCategory, recentTransactions, upcomingReminders } from "./dashboard.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();
router.use(authGuard);

router.get("/kpis", kpis);
router.get("/income-vs-expense", incomeVsExpense);
router.get("/income-by-category", incomeByCategory);
router.get("/expense-by-category", expenseByCategory);
router.get("/recent-transactions", recentTransactions);
router.get("/upcoming-reminders", upcomingReminders);

export default router;
