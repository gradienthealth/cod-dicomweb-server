import { CustomError } from '../../../classes/customClasses';
import fileStreaming from '../../../dataRetrieval/scripts/fileStreaming';

const getMockResponse = () => ({
  ok: true,
  body: {
    getReader: jest.fn().mockReturnValue({
      read: jest
        .fn()
        .mockResolvedValueOnce({ done: false, value: new Uint8Array([1, 2, 3, 4]) })
        .mockResolvedValueOnce({ done: false, value: new Uint8Array([5, 6, 7]) })
        .mockResolvedValueOnce({ done: false, value: new Uint8Array([8, 9, 10]) })
        .mockResolvedValueOnce({ done: true })
    })
  },
  headers: {
    get: jest.fn().mockReturnValue('10')
  }
});

const URL_RESPONSES = {
  invalid_header: Promise.reject(new CustomError('Invalid headers')),
  invalid_url: Promise.reject(new CustomError('Invalid URL')),
  not_ok: Promise.resolve({ ok: false, status: 404 }),
  no_reader: Promise.resolve({ ...getMockResponse(), body: { getReader: () => undefined } }),
  empty_first_chunk: Promise.resolve({
    ...getMockResponse(),
    body: {
      getReader: jest.fn().mockReturnValue({
        read: jest.fn().mockResolvedValueOnce({ done: true })
      })
    }
  }),
  exceed_max_size_1: Promise.resolve(getMockResponse()),
  exceed_max_size_2: Promise.resolve(getMockResponse()),
  working_case_1: Promise.resolve(getMockResponse()),
  working_case_2: Promise.resolve(getMockResponse())
};

describe('fileStreaming', () => {
  let initialFetchedSize: number, initialMaxFetchSize: number;

  beforeAll(() => {
    ({ fetchedSize: initialFetchedSize, maxFetchSize: initialMaxFetchSize } = fileStreaming);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setMaxFetchSize', () => {
    afterEach(() => {
      fileStreaming.setMaxFetchSize(initialMaxFetchSize);
    });

    it('should not set the maxFetchSize if is less than or equal to 0', async () => {
      const newSize = -10;
      fileStreaming.setMaxFetchSize(newSize);
      expect(fileStreaming.maxFetchSize).toBe(initialMaxFetchSize);
    });

    it('should set the maxFetchSize if is greater than 0', async () => {
      const newSize = 100;
      fileStreaming.setMaxFetchSize(newSize);
      expect(fileStreaming.maxFetchSize).toBe(newSize);
    });
  });

  describe('decreaseFetchedSize', () => {
    afterEach(() => {
      fileStreaming.fetchedSize = initialFetchedSize;
    });

    it('should decrease the fetchedSize if the decreaseSize is greater than 0', async () => {
      fileStreaming.fetchedSize = 80;
      const decreaseSize = 50;
      fileStreaming.decreaseFetchedSize(decreaseSize);
      expect(fileStreaming.fetchedSize).toBe(30);
    });

    it('should not decrease the fetchedSize if the decreaseSize is less than or equal to 0', async () => {
      fileStreaming.fetchedSize = 80;
      const decreaseSize = -5;
      fileStreaming.decreaseFetchedSize(decreaseSize);
      expect(fileStreaming.fetchedSize).toBe(80);
    });

    it('should not decrease the fetchedSize if the decreaseSize greater than the fetchedSize', async () => {
      fileStreaming.fetchedSize = 30;
      const decreaseSize = 50;
      fileStreaming.decreaseFetchedSize(decreaseSize);
      expect(fileStreaming.fetchedSize).toBe(30);
    });
  });

  describe('stream', () => {
    global.fetch = jest.fn(async (url: string) => {
      return URL_RESPONSES[url] || Promise.reject(new CustomError('Error Fetching'));
    }) as jest.Mock;

    jest.spyOn(require('../../../fileAccessSystemUtils'), 'createStreamingFileName').mockImplementation((url) => url);

    afterEach(() => {
      jest.clearAllMocks();
      fileStreaming.fetchedSize = initialFetchedSize;
      fileStreaming.setMaxFetchSize(initialMaxFetchSize);
    });

    it('stream with invalid headers', async () => {
      const url = 'invalid_header';
      const headers = { 'Invalid-Header': 'value' };
      const callback = jest.fn();
      await expect(fileStreaming.stream({ url, headers }, callback)).rejects.toThrow('fileStreaming.ts: Invalid headers');
    });

    it('stream with invalid url', async () => {
      const url = 'invalid_url';
      const headers = { 'Invalid-Header': 'value' };
      const callback = jest.fn();
      await expect(fileStreaming.stream({ url, headers }, callback)).rejects.toThrow('fileStreaming.ts: Invalid URL');
    });

    it('should throw an error if fetch fails', async () => {
      const url = 'not_ok';
      const headers = { 'Content-Type': 'application/octet-stream' };
      const callback = jest.fn();
      await expect(fileStreaming.stream({ url, headers }, callback)).rejects.toThrow('fileStreaming.ts: HTTP error! status: 404');
    });

    it('should throw an error if there is no reader', async () => {
      const url = 'no_reader';
      const headers = { 'Content-Type': 'application/octet-stream' };
      const callback = jest.fn();
      await expect(fileStreaming.stream({ url, headers }, callback)).rejects.toThrow(
        'fileStreaming.ts: Failed to get reader from response body'
      );
    });

    it('should throw an error if fetch fails', async () => {
      const url = 'empty_first_chunk';
      const headers = { 'Content-Type': 'application/octet-stream' };
      const callback = jest.fn();
      await expect(fileStreaming.stream({ url, headers }, callback)).rejects.toThrow(
        'fileStreaming.ts: The fetched chunks does not have value'
      );
    });

    it('should throw an error if maxFetchSize is exceeded - case1', async () => {
      const url = 'exceed_max_size_1';
      const headers = { 'Content-Type': 'application/octet-stream' };
      fileStreaming.setMaxFetchSize(3);
      const callback = jest.fn();
      await expect(fileStreaming.stream({ url, headers }, callback)).rejects.toThrow(
        'fileStreaming.ts: Maximum size(3) for fetching files reached'
      );
    });

    it('should throw an error if maxFetchSize is exceeded - case2', async () => {
      const url = 'exceed_max_size_2';
      const headers = { 'Content-Type': 'application/octet-stream' };
      fileStreaming.setMaxFetchSize(5);
      const callback = jest.fn();
      await expect(fileStreaming.stream({ url, headers }, callback)).rejects.toThrow(
        'fileStreaming.ts: Maximum size(5) for fetching files reached'
      );

      expect(global.fetch).toHaveBeenCalledWith(url, { headers, signal: expect.any(AbortSignal) });
      expect(callback).toHaveBeenCalledWith({
        url,
        position: 4,
        fileArraybuffer: Uint8Array.from([1, 2, 3, 4, 0, 0, 0, 0, 0, 0])
      });
    });

    it('should callback the file', async () => {
      const url = 'working_case_1';
      const headers = { 'Content-Type': 'application/octet-stream' };
      const callback = jest.fn();
      await fileStreaming.stream({ url, headers }, callback);

      expect(global.fetch).toHaveBeenCalledWith(url, { headers, signal: expect.any(AbortSignal) });
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenCalledWith({
        url,
        position: 4,
        // To the listener of the postMessage, the first four of fileArraybuffer will have value,
        // the rest will be 0 because listener params are cloned from the postmessage inputs.
        fileArraybuffer: Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      });
      expect(callback).toHaveBeenCalledWith({
        isAppending: true,
        url,
        position: 7,
        chunk: Uint8Array.from([5, 6, 7])
      });
      expect(callback).toHaveBeenCalledWith({
        isAppending: true,
        url,
        position: 10,
        chunk: Uint8Array.from([8, 9, 10])
      });

      expect(fileStreaming.fetchedSize).toBe(10);
    });

    it('should stream with useSharedArrayBuffer', async () => {
      const url = 'working_case_2';
      const headers = { 'Content-Type': 'application/octet-stream' };
      const callback = jest.fn();
      await expect(fileStreaming.stream({ url, headers, useSharedArrayBuffer: true }, callback)).resolves.not.toThrow();

      expect(global.fetch).toHaveBeenCalledWith(url, { headers, signal: expect.any(AbortSignal) });
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenCalledWith({
        url,
        position: 4,
        fileArraybuffer: Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      });
      expect(callback).toHaveBeenCalledWith({
        isAppending: true,
        url,
        position: 7,
        chunk: undefined
      });
      expect(callback).toHaveBeenCalledWith({
        isAppending: true,
        url,
        position: 10,
        chunk: undefined
      });
      expect(fileStreaming.fetchedSize).toBe(10);
    });
  });
});
