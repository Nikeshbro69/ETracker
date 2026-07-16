export interface UploadResult {
  storage_key: string;
  storage_url: string;
  provider: string;
}

export interface StorageProvider {
  upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder?: string
  ): Promise<UploadResult>;

  delete(storageKey: string): Promise<void>;

  getUrl(storageKey: string): string;
}
