import prisma from "../config/db.js";

interface AuditLogParams {
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  ipAddress?: string;
}

export async function writeAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: params.userId ?? null,
        action: params.action,
        entity_type: params.entityType ?? null,
        entity_id: params.entityId ?? null,
        old_values: params.oldValues ?? undefined,
        new_values: params.newValues ?? undefined,
        ip_address: params.ipAddress ?? null,
      },
    });
  } catch (err) {
    // Audit log failures must never crash the app
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}
