import { Router } from "express";
import { create, list, getOne, update, remove } from "./expense.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();
router.use(authGuard);

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
