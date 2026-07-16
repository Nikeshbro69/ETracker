import prisma from "../../config/db.js";
import { AppError } from "../../utils/response.js";
import { getStorageProvider } from "../../providers/storage/index.js";
import { AUDIT_ACTIONS, ATTACHMENT_ENTITY_TYPES, SUPPORTED_MIME_TYPES } from "../../config/constants.js";
import { writeAuditLog } from "../../services/audit.service.js";
import { envConfig } from "../../config/env.config.js";
import path from "path";

type EntityType = (typeof ATTACHMENT_ENTITY_TYPES)[number];

function validateEntityType(type: string): EntityType {
  if (!ATTACHMENT_ENTITY_TYPES.includes(type as EntityType)) {
    throw new AppError(`Invalid entity type. Must be one of: ${ATTACHMENT_ENTITY_TYPES.join(", ")}`, 400);
  }
  return type as EntityType;
}

export async function uploadAttachment(
  entityType: string,
  entityId: string,
  file: Express.Multer.File,
  userId: string
) {
  const validType = validateEntityType(entityType);
  const maxBytes = (envConfig.MAX_ATTACHMENT_SIZE_MB ?? 10) * 1024 * 1024;

  if (file.size > maxBytes) {
    throw new AppError(`File size exceeds ${envConfig.MAX_ATTACHMENT_SIZE_MB}MB limit`, 413);
  }

  if (!SUPPORTED_MIME_TYPES.includes(file.mimetype as (typeof SUPPORTED_MIME_TYPES)[number])) {
    throw new AppError("Unsupported file type. Allowed: PDF, JPG, JPEG, PNG", 400);
  }

  const storage = getStorageProvider();
  const result = await storage.upload(file.buffer, file.originalname, file.mimetype, validType);

  const attachment = await prisma.attachment.create({
    data: {
      entity_type: validType,
      entity_id: entityId,
      file_name: file.originalname,
      file_size: BigInt(file.size),
      mime_type: file.mimetype,
      storage_key: result.storage_key,
      storage_url: result.storage_url,
      provider: result.provider,
      uploaded_by: userId,
    },
  });

  await writeAuditLog({ userId, action: AUDIT_ACTIONS.ATTACHMENT_UPLOADED, entityType: validType, entityId, newValues: { fileName: file.originalname, size: file.size } });

  return { ...attachment, file_size: Number(attachment.file_size) };
}

export async function deleteAttachment(attachmentId: string, userId: string) {
  const attachment = await prisma.attachment.findFirst({ where: { id: attachmentId, deleted_at: null } });
  if (!attachment) throw new AppError("Attachment not found", 404);

  const storage = getStorageProvider();
  try { await storage.delete(attachment.storage_key); } catch { /* best effort */ }

  await prisma.attachment.update({ where: { id: attachmentId }, data: { deleted_at: new Date() } });
  await writeAuditLog({ userId, action: AUDIT_ACTIONS.ATTACHMENT_DELETED, entityType: attachment.entity_type, entityId: attachment.entity_id });
}

export async function getAttachmentFile(storageKey: string) {
  const provider = getStorageProvider();

  // LocalStorageProvider exposes getFilePath
  if ("getFilePath" in provider && typeof (provider as { getFilePath: (k: string) => string }).getFilePath === "function") {
    const filePath = (provider as { getFilePath: (k: string) => string }).getFilePath(storageKey);
    return { filePath, ext: path.extname(storageKey) };
  }

  throw new AppError("File streaming only supported for local storage", 400);
}
