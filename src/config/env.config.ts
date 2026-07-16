import { config } from "dotenv";
import { z } from "zod";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

if (process.env.NODE_ENV === "development") {
  console.log("Running in development mode.");
  config({ path: join(__dirname, "../../dev.env") });
} else {
  console.log("Running in production mode.");
  config({ path: join(__dirname, "../../.env") });
}

const envSchema = z.object({
  NODE_ENV: z.enum(["production", "development"]),
  PORT: z
    .string()
    .regex(/^\d+$/, "PORT must be a number")
    .transform(Number)
    .optional()
    .default("3001"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z.string().min(1, "JWT_ACCESS_SECRET is required"),
  JWT_REFRESH_SECRET: z.string().min(1, "JWT_REFRESH_SECRET is required"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  STORAGE_PROVIDER: z.enum(["local", "cloudinary"]).default("local"),
  LOCAL_UPLOAD_PATH: z.string().default("./uploads"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  MAX_ATTACHMENT_SIZE_MB: z
    .string()
    .regex(/^\d+$/)
    .transform(Number)
    .optional()
    .default("10"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
});

export const envConfig = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN,
  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER,
  LOCAL_UPLOAD_PATH: process.env.LOCAL_UPLOAD_PATH,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  MAX_ATTACHMENT_SIZE_MB: process.env.MAX_ATTACHMENT_SIZE_MB,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});

export type EnvConfig = typeof envConfig;
