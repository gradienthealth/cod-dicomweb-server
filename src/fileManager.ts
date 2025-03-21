import type { FileManagerOptions } from './types';
import { getDataRetrievalManager } from './dataRetrieval/dataRetrievalManager';

class FileManager {
  private files: Record<string, { data: Uint8Array; position: number }> = {};
  private fileStreamingScriptName: string;

  constructor({ fileStreamingScriptName }: FileManagerOptions) {
    this.fileStreamingScriptName = fileStreamingScriptName;
  }

  set(url: string, file: { data: Uint8Array; position: number }): void {
    this.files[url] = file;
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
    return Object.entries(this.files).reduce((total, [url, { position }]) => {
      return url.includes('?bytes=') ? total : total + position;
    }, 0);
  }

  remove(url: string): void {
    const removedSize = this.getPosition(url);
    delete this.files[url];

    if (url.includes('?bytes=')) {
      return;
    }

    const retrievalManager = getDataRetrievalManager();
    retrievalManager.executeTask(this.fileStreamingScriptName, 'decreaseFetchedSize', removedSize);
  }

  purge(): void {
    const totalSize = this.getTotalSize();
    this.files = {};

    const retrievalManager = getDataRetrievalManager();
    retrievalManager.executeTask(this.fileStreamingScriptName, 'decreaseFetchedSize', totalSize);
  }
}

export default FileManager;
