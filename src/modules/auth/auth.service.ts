import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import { envConfig } from "../../config/env.config.js";
import { AppError } from "../../utils/response.js";
import { AUDIT_ACTIONS } from "../../config/constants.js";
import { writeAuditLog } from "../../services/audit.service.js";

export async function loginUser(
  email: string,
  password: string,
  ipAddress?: string
) {
  const user = await prisma.user.findFirst({
    where: { email, deleted_at: null },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user) {
    await writeAuditLog({
      action: AUDIT_ACTIONS.USER_LOGIN_FAILED,
      entityType: "user",
      ipAddress,
    });
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    await writeAuditLog({
      action: AUDIT_ACTIONS.USER_LOGIN_FAILED,
      entityType: "user",
      entityId: user.id,
      ipAddress,
    });
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    envConfig.JWT_ACCESS_SECRET,
    { expiresIn: envConfig.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    envConfig.JWT_REFRESH_SECRET,
    { expiresIn: envConfig.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.refreshToken.create({
    data: {
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
    },
  });

  await writeAuditLog({
    userId: user.id,
    action: AUDIT_ACTIONS.USER_LOGIN,
    entityType: "user",
    entityId: user.id,
    ipAddress,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      roles: user.userRoles.map((ur) => ur.role.name),
    },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload: { userId: string };
  try {
    payload = jwt.verify(refreshToken, envConfig.JWT_REFRESH_SECRET) as {
      userId: string;
    };
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const stored = await prisma.refreshToken.findFirst({
    where: { token: refreshToken, revoked: false },
  });

  if (!stored || stored.expires_at < new Date()) {
    throw new AppError("Refresh token expired or revoked", 401);
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, deleted_at: null },
  });

  if (!user) throw new AppError("User not found", 401);

  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    envConfig.JWT_ACCESS_SECRET,
    { expiresIn: envConfig.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  return { accessToken };
}

export async function logoutUser(refreshToken: string, userId: string, ipAddress?: string) {
  await prisma.refreshToken.updateMany({
    where: { token: refreshToken, user_id: userId },
    data: { revoked: true },
  });

  await writeAuditLog({
    userId,
    action: AUDIT_ACTIONS.USER_LOGOUT,
    entityType: "user",
    entityId: userId,
    ipAddress,
  });
}

export async function getMe(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId, deleted_at: null },
    include: { userRoles: { include: { role: true } } },
  });
  if (!user) throw new AppError("User not found", 404);
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    roles: user.userRoles.map((ur) => ur.role.name),
  };
}
