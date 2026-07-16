import { Router } from "express";
import { uploadFile, removeFile, streamFile, uploadMiddleware } from "./attachment.controller.js";
import { authGuard } from "../../middleware/authGuard.js";

const router = Router();

// File stream: GET /attachments/file?key=<base64-encoded-storage-key>
router.get("/file", authGuard, streamFile);

// Upload/delete per entity
router.post("/:entityType/:entityId", authGuard, uploadMiddleware, uploadFile);
router.delete("/:attachmentId", authGuard, removeFile);

export default router;
