export const PAYMENT_METHODS = [
  "Cash",
  "Bank Transfer",
  "Cheque",
  "eSewa",
  "Khalti",
  "Other",
] as const;

export const REMINDER_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
export const REMINDER_STATUSES = ["PENDING", "COMPLETED"] as const;
export const REMINDER_REPEATS = [
  "NONE",
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
] as const;

export const ATTACHMENT_ENTITY_TYPES = [
  "income",
  "expense",
  "reminder",
] as const;

export const SUPPORTED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
] as const;

export const SUPPORTED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"] as const;

export const AUDIT_ACTIONS = {
  USER_LOGIN: "USER_LOGIN",
  USER_LOGOUT: "USER_LOGOUT",
  USER_LOGIN_FAILED: "USER_LOGIN_FAILED",
  INCOME_CREATED: "INCOME_CREATED",
  INCOME_UPDATED: "INCOME_UPDATED",
  INCOME_DELETED: "INCOME_DELETED",
  EXPENSE_CREATED: "EXPENSE_CREATED",
  EXPENSE_UPDATED: "EXPENSE_UPDATED",
  EXPENSE_DELETED: "EXPENSE_DELETED",
  ATTACHMENT_UPLOADED: "ATTACHMENT_UPLOADED",
  ATTACHMENT_DELETED: "ATTACHMENT_DELETED",
  REMINDER_CREATED: "REMINDER_CREATED",
  REMINDER_COMPLETED: "REMINDER_COMPLETED",
  REMINDER_DELETED: "REMINDER_DELETED",
  NOTE_CREATED: "NOTE_CREATED",
  NOTE_UPDATED: "NOTE_UPDATED",
  NOTE_DELETED: "NOTE_DELETED",
  REPORT_EXPORTED: "REPORT_EXPORTED",
} as const;
