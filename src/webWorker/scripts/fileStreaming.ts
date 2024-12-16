const fileStreaming = {
  maxFetchSize: 0,
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

  async stream(args: { url: string; headers?: Record<string, string>; useSharedArrayBuffer?: boolean }): Promise<void> {
    const { url, headers, useSharedArrayBuffer } = args;
    const controller = new AbortController();
    let sharedArraybuffer: SharedArrayBuffer | null = null;
    let fileArraybuffer: Uint8Array | null = null;

    try {
      const response = await fetch(url, {
        headers: { ...headers },
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader from response body');
      }

      let result: ReadableStreamReadResult<Uint8Array>;
      let completed = false;
      const totalLength = parseInt(response.headers.get('Content-Length') || '0', 10);
      const firstChunk = await reader.read();
      completed = firstChunk.done;

      if (!firstChunk.value) {
        throw new Error('The fetched chunks does not have value');
      }

      if (!completed) {
        let position = firstChunk.value.length;

        if (this.maxFetchSize && this.fetchedSize + position > this.maxFetchSize) {
          controller.abort();
          throw new Error(`Maximum size(${this.maxFetchSize}) for fetching files reached`);
        }

        this.fetchedSize += position;

        if (useSharedArrayBuffer) {
          sharedArraybuffer = new SharedArrayBuffer(totalLength);
          fileArraybuffer = new Uint8Array(sharedArraybuffer);
        } else {
          fileArraybuffer = new Uint8Array(totalLength);
        }
        fileArraybuffer.set(firstChunk.value);
        postMessage({ url, position, fileArraybuffer });

        while (!completed) {
          result = await reader.read();

          if (result.done) {
            completed = true;
            continue;
          }

          const chunk = result.value;

          if (this.maxFetchSize && this.fetchedSize + chunk.length > this.maxFetchSize) {
            sharedArraybuffer = null;
            fileArraybuffer = null;
            controller.abort();
            throw new Error(`Maximum size(${this.maxFetchSize}) for fetching files reached`);
          }

          this.fetchedSize += chunk.length;
          fileArraybuffer.set(chunk, position);
          position += chunk.length;

          postMessage({
            isAppending: true,
            url,
            position: position,
            chunk: !useSharedArrayBuffer ? chunk : null
          });
        }
      }
    } catch (error) {
      const streamingError = new Error('fileStreaming.ts: ' + (error as Error).message || 'An error occured when streaming');
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
