import { Router } from "express";
import { getIncomeCategories, getExpenseCategories } from "./category.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();
router.use(authGuard);

router.get("/income", getIncomeCategories);
router.get("/expense", getExpenseCategories);

export default router;
