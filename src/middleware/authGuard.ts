import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { envConfig } from "../config/env.config.js";
import { AppError } from "../utils/response.js";

export interface JwtPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authGuard(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Missing or invalid authorization header", 401));
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, envConfig.JWT_ACCESS_SECRET) as JwtPayload;
    req.user = payload;
    return next();
  } catch {
    return next(new AppError("Invalid or expired access token", 401));
  }
}
