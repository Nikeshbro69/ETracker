import fs from "fs";
import path from "path";
import { envConfig } from "../../config/env.config.js";
import type { StorageProvider, UploadResult } from "./StorageService.js";
import { v4 as uuidv4 } from "uuid";

export class LocalStorageProvider implements StorageProvider {
  private uploadPath: string;

  constructor() {
    this.uploadPath = envConfig.LOCAL_UPLOAD_PATH;
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async upload(
    buffer: Buffer,
    originalName: string,
    _mimeType: string,
    folder = "attachments"
  ): Promise<UploadResult> {
    const ext = path.extname(originalName);
    const fileName = `${uuidv4()}${ext}`;
    const folderPath = path.join(this.uploadPath, folder);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const filePath = path.join(folderPath, fileName);
    await fs.promises.writeFile(filePath, buffer);

    const storage_key = `${folder}/${fileName}`;
    const storage_url = `/api/v1/attachments/file?key=${Buffer.from(storage_key).toString("base64")}`;

    return { storage_key, storage_url, provider: "local" };
  }

  async delete(storageKey: string): Promise<void> {
    const filePath = path.join(this.uploadPath, storageKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  getUrl(storageKey: string): string {
    return `/api/v1/attachments/file/${encodeURIComponent(storageKey)}`;
  }

  getFilePath(storageKey: string): string {
    return path.join(this.uploadPath, storageKey);
  }
}
