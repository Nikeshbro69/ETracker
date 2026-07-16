import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/response.js";
import { envConfig } from "../config/env.config.js";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation errors (Zod v4 uses .issues, v3 uses .errors)
  if (err instanceof ZodError) {
    const issues = (err.issues ?? (err as unknown as { errors: typeof err.issues }).errors) ?? [];
    return res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: issues.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    });
  }

  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    });
  }

  // Multer file size error
  if (err && typeof err === "object" && "code" in err) {
    const e = err as { code: string; message: string };
    if (e.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        error: { code: "FILE_TOO_LARGE", message: "File exceeds size limit" },
      });
    }
  }

  // Unknown errors
  if (envConfig.NODE_ENV === "development") {
    console.error(err);
  }

  return res.status(500).json({
    success: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "An unexpected error occurred" },
  });
}
