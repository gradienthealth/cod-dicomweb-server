import type { FileManagerFile } from './types';

class FileManager {
  private files: Record<string, FileManagerFile> = {};

  set(url: string, file: Omit<FileManagerFile, 'lastModified'>): void {
    this.files[url] = { ...file, lastModified: Date.now() };
  }

  get(url: string, offsets?: { startByte: number; endByte: number }): Uint8Array | null {
    if (!this.files[url] || (offsets && this.files[url].position <= offsets.endByte)) {
      return null;
    }

    return offsets ? this.files[url].data.slice(offsets.startByte, offsets.endByte) : this.files[url].data;
  }

  setPosition(url: string, position: number): void {
    if (this.files[url]) {
      this.files[url].position = position;
      this.files[url].lastModified = Date.now();
    }
  }

  getPosition(url: string): number {
    return this.files[url]?.position;
  }

  append(url: string, chunk: Uint8Array, position: number): void {
    if (this.files[url] && position) {
      this.files[url].data.set(chunk, position - chunk.length);
      this.setPosition(url, position);
    }
  }

  getTotalSize(): number {
    return Object.values(this.files).reduce((total, { data }) => {
      return total + data.byteLength;
    }, 0);
  }

  remove(url: string): void {
    try {
      delete this.files[url];
      console.log(`Removed ${url} from CodDicomwebServer cache`);
    } catch (error) {
      console.warn(`Error removing ${url} from CodDicomwebServer cache:`, error);
    }
  }

  purge(): void {
    const fileURLs = Object.keys(this.files);
    const totalSize = this.getTotalSize();
    fileURLs.forEach((url) => this.remove(url));

    console.log(`Purged ${totalSize - this.getTotalSize()} bytes from CodDicomwebServer cache`);
  }

  decacheNecessaryBytes(url: string, bytesNeeded: number): number {
    const totalSize = this.getTotalSize();
    const filesToDelete: string[] = [];
    let collectiveSize = 0;

    Object.entries(this.files)
      .sort(([, a], [, b]) => a.lastModified - b.lastModified)
      .forEach(([key, file]) => {
        if (collectiveSize < bytesNeeded && key !== url) {
          filesToDelete.push(key);
          collectiveSize += file.data.byteLength;
        }
      });

    filesToDelete.forEach((key) => this.remove(key));

    console.log(`Decached ${totalSize - this.getTotalSize()} bytes`);
    return collectiveSize;
  }
}

export default FileManager;
