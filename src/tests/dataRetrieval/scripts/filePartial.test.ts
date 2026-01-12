import { CustomError } from '../../../classes/customClasses';
import filePartial from '../../../dataRetrieval/scripts/filePartial';

const URL_RESPONSES = {
  not_ok: Promise.resolve({ ok: false, statusText: 'Unsuccessful fetch' }),
  throw_an_error: Promise.reject(new CustomError('Error fetching')),
  invalid_url: Promise.reject(new CustomError('Invalid URL')),
  invalid_header: Promise.reject(new CustomError('Invalid headers')),
  ok_but_no_arraybuffer_function: Promise.resolve({ ok: true }),
  working_case: Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(new Uint8Array(10)) })
};

describe('filePartial', () => {
  global.fetch = jest.fn(async (url: string, options?: { headers?: Record<string, string> }) => {
    const { Range } = options?.headers || {};
    if (Range) {
      const rangeParts = Range.split('bytes=')[1].split('-');
      const result = (await (await URL_RESPONSES[url]).arrayBuffer()).slice(+rangeParts[0], +rangeParts[1]);
      return Promise.resolve({ ok: true, arrayBuffer: () => Promise.resolve(result) });
    }
    return URL_RESPONSES[url];
  }) as jest.Mock;

  jest.spyOn(require('../../../fileAccessSystemUtils'), 'createPartialFileName').mockImplementation((url) => url);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should return an Error when the request fails', async () => {
    const url = 'throw_an_error';
    const offsets = { startByte: 0, endByte: 4 };
    const headers = { 'Content-Type': 'application/json' };
    const callback = jest.fn();
    await expect(filePartial.partial({ url, offsets, headers }, callback)).rejects.toThrow(
      'filePartial.ts: Error when fetching file: Error fetching'
    );
  });

  it('should return an Error when the url is invalid', async () => {
    const url = 'invalid_url';
    const offsets = { startByte: 0, endByte: 4 };
    const callback = jest.fn();
    await expect(filePartial.partial({ url, offsets }, callback)).rejects.toThrow(
      'filePartial.ts: Error when fetching file: Invalid URL'
    );
  });

  it('should return an Error when headers are invalid', async () => {
    const url = 'invalid_header';
    const offsets = { startByte: 0, endByte: 4 };
    const headers = { invalid: 'header' };
    const callback = jest.fn();
    await expect(filePartial.partial({ url, offsets, headers }, callback)).rejects.toThrow(
      'filePartial.ts: Error when fetching file: Invalid headers'
    );
  });

  it('should return an Error when arrayBuffer function is not present', async () => {
    const url = 'ok_but_no_arraybuffer_function';
    const offsets = { startByte: 0, endByte: 4 };
    const headers = { 'Content-Type': 'application/json' };
    const callback = jest.fn();
    await expect(filePartial.partial({ url, offsets, headers }, callback)).rejects.toThrow(
      'filePartial.ts: Error when fetching file: response.arrayBuffer is not a function'
    );
  });

  it('should return an arraybuffer when the request is successful', async () => {
    const url = 'working_case';
    const offsets = { startByte: 0, endByte: 4 };
    const headers = { 'Content-Type': 'application/json' };
    const callback = jest.fn();
    const expected = await (await URL_RESPONSES[url]).arrayBuffer();
    await expect(filePartial.partial({ url, offsets, headers }, callback)).resolves.toEqual(expected);
    expect(callback).toHaveBeenCalledWith({ url, fileArraybuffer: new Uint8Array(expected), offsets });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should return an arraybuffer slice when the Range header is provided', async () => {
    const url = 'working_case';
    const offsets = { startByte: 3, endByte: 8 };
    const headers = { 'Content-Type': 'application/json' };
    const callback = jest.fn();
    const expected = (await (await URL_RESPONSES[url]).arrayBuffer()).slice(3, 7);
    await expect(filePartial.partial({ url, offsets, headers }, callback)).resolves.toEqual(expected);
    expect(callback).toHaveBeenCalledWith({ url, fileArraybuffer: new Uint8Array(expected), offsets });
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
