import { Router } from "express";
import { create, list, getOne, update, remove, pin, archive } from "./note.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();
router.use(authGuard);

router.post("/", create);
router.get("/", list);
router.get("/:id", getOne);
router.patch("/:id", update);
router.delete("/:id", remove);
router.patch("/:id/pin", pin);
router.patch("/:id/archive", archive);

export default router;
