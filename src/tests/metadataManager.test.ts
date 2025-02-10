import MetadataManager from '../metadataManager';

const URL_RESPONSES = {
  not_ok: { ok: false, statusText: 'Unsuccessful fetch' },
  ok_but_no_json_function: { ok: true },
  ok_but_failed_json_function: { ok: true, json: () => Promise.reject(new Error('Error Parsing')) },
  ok_but_empty_json: { ok: true, json: () => Promise.resolve({}) },
  working_case: {
    ok: true,
    json: () =>
      Promise.resolve({
        deid_study_uid: '<deidStudyUid>',
        deid_series_uid: '<deidSeriesUid>',
        cod: {
          instances: {
            //@ts-ignore
            '<deidSopUid>': {
              metadata: { '00080018': { vr: 'UI', Value: ['<sopUid-1>'] } },
              uri: 'studies/relative/url/to/the/file'
            }
          }
        }
      })
  }
};

describe('getMetadata', () => {
  const params = {
    domain: '<domain>',
    bucketName: '<bucket_name>',
    bucketPrefix: '<bucket_prefix>',
    studyInstanceUID: '<studyUid>',
    seriesInstanceUID: '<seriesUid>'
  };
  const headers = { Accept: 'application/json' };
  let metadataManager: MetadataManager;

  global.fetch = jest.fn((url: string) => Promise.resolve(URL_RESPONSES[url])) as jest.Mock;
  const createMetadataJsonUrlMock = jest.spyOn(require('../classes/utils'), 'createMetadataJsonUrl');

  beforeEach(() => {
    jest.clearAllMocks();
    metadataManager = new MetadataManager();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should throw an error if the url is not created', async () => {
    createMetadataJsonUrlMock.mockImplementation(() => undefined);

    const expected = 'Error creating metadata json url';
    await expect(metadataManager.getMetadata(params, headers)).rejects.toThrow(expected);
  });

  it('should throw an error when fetch is unsuccessful', async () => {
    createMetadataJsonUrlMock.mockImplementation(() => 'not_ok');

    const expected = `Failed to fetch metadata: ${URL_RESPONSES.not_ok.statusText}`;
    await expect(metadataManager.getMetadata(params, headers)).rejects.toThrow(expected);
  });

  it('should throw an error when there is no json function in the response', async () => {
    createMetadataJsonUrlMock.mockImplementation(() => 'ok_but_no_json_function');

    const expected = `response.json is not a function`;
    await expect(metadataManager.getMetadata(params, headers)).rejects.toThrow(expected);
  });

  it('should throw an error when there is a error in json function in the response', async () => {
    createMetadataJsonUrlMock.mockImplementation(() => 'ok_but_failed_json_function');

    const expected = `Error Parsing`;
    await expect(metadataManager.getMetadata(params, headers)).rejects.toThrow(expected);
  });

  it('should return a empty object if the json is empty', async () => {
    createMetadataJsonUrlMock.mockImplementation(() => 'ok_but_empty_json');

    const expected = await URL_RESPONSES.ok_but_empty_json.json();
    await expect(metadataManager.getMetadata(params, headers)).resolves.toEqual(expected);
  });

  it('should return metadata when fetch is successful', async () => {
    createMetadataJsonUrlMock.mockImplementation(() => 'working_case');

    const expected = await URL_RESPONSES.working_case.json();
    // @ts-ignore
    metadataManager.addDeidMetadata(expected);
    await expect(metadataManager.getMetadata(params, headers)).resolves.toEqual(expected);
  });

  it('should return metadata when the metadata is cached', async () => {
    metadataManager.getMetadataFromCache = jest.fn(() => ({ some: 'metadata' })) as jest.Mock;

    const expected = { some: 'metadata' };
    await expect(metadataManager.getMetadata(params, headers)).resolves.toEqual(expected);
  });
});
