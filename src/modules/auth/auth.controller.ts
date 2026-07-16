import type { Request, Response, NextFunction } from "express";
import { loginSchema } from "./auth.validation.js";
import {
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMe,
} from "./auth.service.js";
import { sendSuccess, sendCreated } from "../../utils/response.js";

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(
      input.email,
      input.password,
      req.ip ?? undefined
    );

    // Set refresh token in HttpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    return sendCreated(res, {
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: "401", message: "No refresh token provided" },
      });
    }
    const result = await refreshAccessToken(token);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.refreshToken as string | undefined;
    if (token && req.user) {
      await logoutUser(token, req.user.userId, req.ip ?? undefined);
    }
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getMe(req.user!.userId);
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}
