import filePartial from '../../../webWorker/scripts/filePartial';

const URL_RESPONSES = {
  not_ok: Promise.resolve({ ok: false, statusText: 'Unsuccessful fetch' }),
  throw_an_error: Promise.reject(new Error('Error fetching')),
  invalid_url: Promise.reject(new Error('Invalid URL')),
  invalid_header: Promise.reject(new Error('Invalid headers')),
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should return an Error when the request fails', async () => {
    const url = 'throw_an_error';
    const headers = { 'Content-Type': 'application/json' };
    await expect(filePartial.partial({ url, headers })).rejects.toThrow(
      'filePartial.ts: Error when fetching file: Error fetching'
    );
  });

  it('should return an Error when the url is invalid', async () => {
    const url = 'invalid_url';
    await expect(filePartial.partial({ url })).rejects.toThrow('filePartial.ts: Error when fetching file: Invalid URL');
  });

  it('should return an Error when headers are invalid', async () => {
    const url = 'invalid_header';
    const headers = { invalid: 'header' };
    await expect(filePartial.partial({ url, headers })).rejects.toThrow(
      'filePartial.ts: Error when fetching file: Invalid headers'
    );
  });

  it('should return an Error when arrayBuffer function is not present', async () => {
    const url = 'ok_but_no_arraybuffer_function';
    const headers = { 'Content-Type': 'application/json' };
    await expect(filePartial.partial({ url, headers })).rejects.toThrow(
      'filePartial.ts: Error when fetching file: response.arrayBuffer is not a function'
    );
  });

  it('should return an arraybuffer when the request is successful', async () => {
    const url = 'working_case';
    const headers = { 'Content-Type': 'application/json' };
    const expected = await (await URL_RESPONSES[url]).arrayBuffer();
    await expect(filePartial.partial({ url, headers })).resolves.toEqual(expected);
  });

  it('should return an arraybuffer slice when the Range header is provided', async () => {
    const url = 'working_case';
    const headers = { 'Content-Type': 'application/json', Range: 'bytes=3-7' };
    const expected = (await (await URL_RESPONSES[url]).arrayBuffer()).slice(3, 7);
    await expect(filePartial.partial({ url, headers })).resolves.toEqual(expected);
  });
});
