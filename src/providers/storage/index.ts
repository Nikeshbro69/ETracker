import { envConfig } from "../../config/env.config.js";
import { LocalStorageProvider } from "./LocalStorageProvider.js";
import { CloudinaryProvider } from "./CloudinaryProvider.js";
import type { StorageProvider } from "./StorageService.js";

let instance: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (instance) return instance;

  if (envConfig.STORAGE_PROVIDER === "cloudinary") {
    instance = new CloudinaryProvider();
  } else {
    instance = new LocalStorageProvider();
  }

  return instance;
}

export type { StorageProvider, UploadResult } from "./StorageService.js";
