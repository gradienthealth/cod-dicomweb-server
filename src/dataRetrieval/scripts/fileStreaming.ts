import { CustomError } from '../../classes/customClasses';
import { createStreamingFileName, readFile, writeFile } from '../../fileAccessSystemUtils';

const fileStreaming = {
  maxFetchSize: 4 * 1024 * 1024 * 1024, // 4GB
  fetchedSize: 0,

  setMaxFetchSize(size: number): void {
    if (size > 0) {
      this.maxFetchSize = size;
    }
  },

  decreaseFetchedSize(size: number): void {
    if (size > 0 && size <= this.fetchedSize) {
      this.fetchedSize -= size;
    }
  },

  async stream(
    args: {
      url: string;
      headers?: Record<string, string>;
      useSharedArrayBuffer?: boolean;
      directoryHandle?: FileSystemDirectoryHandle;
    },
    callBack: (data: {
      url: string;
      position: number;
      isAppending?: boolean;
      fileArraybuffer?: Uint8Array;
      chunk?: Uint8Array;
    }) => void
  ): Promise<Uint8Array | void> {
    const { url, headers, useSharedArrayBuffer, directoryHandle } = args;
    const controller = new AbortController();
    let sharedArraybuffer: SharedArrayBuffer | null = null;
    let fileArraybuffer: Uint8Array | null = null;

    try {
      const fileName = createStreamingFileName(url);
      if (directoryHandle) {
        const file = await readFile(directoryHandle, fileName);
        if (file) {
          callBack({ url, position: file.byteLength, fileArraybuffer: new Uint8Array(file) });
          return;
        }
      }

      const response = await fetch(url, {
        headers: { ...headers },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new CustomError(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new CustomError('Failed to get reader from response body');
      }

      let result: ReadableStreamReadResult<Uint8Array>;
      let completed = false;
      const totalLength = parseInt(response.headers.get('Content-Length') || '0', 10);
      const firstChunk = await reader.read();
      completed = firstChunk.done;

      if (!firstChunk.value) {
        throw new CustomError('The fetched chunks does not have value');
      }

      if (!completed) {
        let position = firstChunk.value.length;

        if (this.fetchedSize + position > this.maxFetchSize) {
          controller.abort();
          throw new CustomError(`Maximum size(${this.maxFetchSize}) for fetching files reached`);
        }

        this.fetchedSize += position;

        if (useSharedArrayBuffer) {
          sharedArraybuffer = new SharedArrayBuffer(totalLength);
          fileArraybuffer = new Uint8Array(sharedArraybuffer);
        } else {
          fileArraybuffer = new Uint8Array(totalLength);
        }
        fileArraybuffer.set(firstChunk.value);
        callBack({ url, position, fileArraybuffer });

        while (!completed) {
          result = await reader.read();

          if (result.done) {
            completed = true;
            continue;
          }

          const chunk = result.value;

          if (this.fetchedSize + chunk.length > this.maxFetchSize) {
            sharedArraybuffer = null;
            fileArraybuffer = null;
            controller.abort();
            throw new CustomError(`Maximum size(${this.maxFetchSize}) for fetching files reached`);
          }

          this.fetchedSize += chunk.length;
          fileArraybuffer.set(chunk, position);
          position += chunk.length;

          callBack({
            isAppending: true,
            url,
            position: position,
            chunk: !useSharedArrayBuffer ? chunk : undefined
          });
        }

        if (directoryHandle) {
          writeFile(directoryHandle, fileName, fileArraybuffer.slice().buffer);
        }
      }
    } catch (error) {
      const streamingError = new CustomError(
        'fileStreaming.ts: ' + (error as CustomError).message || 'An error occured when streaming'
      );
      console.error(streamingError.message, error);
      throw streamingError;
    } finally {
      sharedArraybuffer = null;
      fileArraybuffer = null;
      controller.abort();
    }
  }
};

export default fileStreaming;
