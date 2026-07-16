import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { uploadAttachment, deleteAttachment, getAttachmentFile } from "./attachment.service.js";
import { sendCreated, sendNoContent, AppError } from "../../utils/response.js";
import { envConfig } from "../../config/env.config.js";

// Use memory storage so we can pipe to StorageProvider
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (envConfig.MAX_ATTACHMENT_SIZE_MB ?? 10) * 1024 * 1024 },
});

export const uploadMiddleware = upload.single("file");

export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new AppError("No file provided", 400);
    const { entityType, entityId } = req.params;
    const attachment = await uploadAttachment(entityType, entityId, req.file, req.user!.userId);
    return sendCreated(res, attachment);
  } catch (err) { next(err); }
}

export async function removeFile(req: Request, res: Response, next: NextFunction) {
  try {
    await deleteAttachment(req.params.attachmentId, req.user!.userId);
    return sendNoContent(res);
  } catch (err) { next(err); }
}

export async function streamFile(req: Request, res: Response, next: NextFunction) {
  try {
    const rawKey = req.query.key as string | undefined;
    if (!rawKey) throw new AppError("Missing key parameter", 400);
    const storageKey = Buffer.from(rawKey, "base64").toString("utf8");
    const { filePath } = await getAttachmentFile(storageKey);
    return res.sendFile(filePath, { root: "/" });
  } catch (err) { next(err); }
}
