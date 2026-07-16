import { v2 as cloudinary } from "cloudinary";
import { envConfig } from "../../config/env.config.js";
import type { StorageProvider, UploadResult } from "./StorageService.js";

export class CloudinaryProvider implements StorageProvider {
  constructor() {
    cloudinary.config({
      cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
      api_key: envConfig.CLOUDINARY_API_KEY,
      api_secret: envConfig.CLOUDINARY_API_SECRET,
    });
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder = "fms/attachments"
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const resourceType = mimeType === "application/pdf" ? "raw" : "image";
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: resourceType, original_filename: originalName },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error("Upload failed"));
          resolve({
            storage_key: result.public_id,
            storage_url: result.secure_url,
            provider: "cloudinary",
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  async delete(storageKey: string): Promise<void> {
    await cloudinary.uploader.destroy(storageKey);
  }

  getUrl(storageKey: string): string {
    return cloudinary.url(storageKey);
  }
}
