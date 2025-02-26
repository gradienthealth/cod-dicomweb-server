import { CodDicomWebServer } from '../../classes';
import { Enums, url } from '../../constants';
import type { JsonMetadata } from '../../types';

describe('CodDicomWebServer', () => {
  let server: CodDicomWebServer;
  const getDataRetrievalManagerMock = jest.spyOn(require('../../dataRetrieval/dataRetrievalManager'), 'getDataRetrievalManager');
  const fileManagerMock = jest.spyOn(require('../../fileManager'), 'default');
  const metadataManagerMock = jest.spyOn(require('../../metadataManager'), 'default');

  const workerAddEventListener = jest.fn();
  const fileManagerSet = jest.fn();
  const fileManagerGet = jest.fn();
  const fileManagerSetPosition = jest.fn();
  const fileManagerGetPosition = jest.fn();
  const fileManagerGetTotalSize = jest.fn();
  const fileManagerRemove = jest.fn();
  const metadataManagerGetMetadata = jest.fn().mockResolvedValue({
    deid_study_uid: '<deidStudyUid>',
    deid_series_uid: '<deidSeriesUid>',
    cod: {
      instances: {
        //@ts-ignore
        '<deidSopUid>': {
          metadata: { '00080018': { vr: 'UI', Value: ['<sopUid-1>'] } },
          uri: 'studies/relative/url/to/the/file',
          headers: { start_byte: 100, end_byte: 419 },
          offset_tables: { CustomOffsetTable: [20, 120, 218], CustomOffsetTableLengths: [92, 90, 93] }
        }
      }
    },
    thumbnail: {
      version: '0.0.1',
      uri: 'gs://<bucketName>/<bucketPrefix>/path/to/thumbnail',
      thumbnail_index_to_instance_frame: [],
      instances: {}
    }
  });

  beforeEach(() => {
    getDataRetrievalManagerMock.mockImplementation(() => ({
      getDataRetrieverMode: jest.fn(),
      register: jest.fn(),
      executeTask: jest.fn(() => Promise.resolve()),
      addEventListener: workerAddEventListener,
      removeEventListener: jest.fn(),
      reset: jest.fn()
    }));
    fileManagerMock.mockImplementation(() => ({
      set: fileManagerSet,
      get: fileManagerGet,
      setPosition: fileManagerSetPosition,
      getPosition: fileManagerGetPosition,
      getTotalSize: fileManagerGetTotalSize,
      remove: fileManagerRemove
    }));
    metadataManagerMock.mockImplementation(() => ({
      getMetadata: metadataManagerGetMetadata
    }));

    server = new CodDicomWebServer();
  });

  describe('constructor', () => {
    it('should create a new instance with default options', () => {
      expect(server).toBeInstanceOf(CodDicomWebServer);
    });

    it('should create a new instance with custom options', () => {
      const options = { maxWorkerFetchSize: 10000, domain: 'example.com' };
      const serverWithCustomOptions = new CodDicomWebServer(options);
      expect(serverWithCustomOptions).toBeInstanceOf(CodDicomWebServer);
    });
  });

  describe('getOptions', () => {
    it('should return the default options if not set', () => {
      const options = server.getOptions();
      expect(options).toEqual({ maxWorkerFetchSize: Infinity, domain: url.DOMAIN });
    });
  });

  describe('setOptions', () => {
    it('should set new options', () => {
      const newOptions = { maxWorkerFetchSize: 2000 };
      server.setOptions(newOptions);
      expect(server.getOptions()).toEqual({ domain: url.DOMAIN, ...newOptions });
    });

    it('should not set new options if the value is undefined', () => {
      const newOptions = { maxWorkerFetchSize: 2000, domain: undefined };
      server.setOptions(newOptions);
      expect(server.getOptions()).toEqual({ domain: url.DOMAIN, maxWorkerFetchSize: newOptions.maxWorkerFetchSize });
    });
  });

  describe('fetchCod', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if wadorsUrl is invalid', async () => {
      const wadorsUrl = '';
      const headers = { 'Content-Type': 'application/json' };
      const options = { useSharedArrayBuffer: true, fetchType: Enums.FetchType.API_OPTIMIZED };
      await expect(server.fetchCod(wadorsUrl, headers, options)).rejects.toThrow('CodDicomWebServer.ts: Url not provided');
    });

    it('should fetch COD data for non-wadors url', async () => {
      const wadorsUrl = 'https://example.com/wadors';
      const headers = { 'Content-Type': 'application/json' };
      const expected = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).buffer;
      jest.spyOn(server, 'fetchFile').mockResolvedValueOnce(expected);
      const options = { useSharedArrayBuffer: true, fetchType: Enums.FetchType.API_OPTIMIZED };

      await expect(server.fetchCod(wadorsUrl, headers, options)).resolves.toEqual(expected);
    });

    it('should return instance metadata for wadors url for instance metadata', async () => {
      server.setOptions({ domain: 'https://example.com' });
      const wadorsUrl =
        'https://example.com/<bucketName>/<bucketPrefixWith>/dicomweb/studies/<studyUid>/series/<seriesUid>/instances/<sopUid-1>/metadata';
      const headers = { 'Content-Type': 'application/json' };
      const options = { useSharedArrayBuffer: true, fetchType: Enums.FetchType.API_OPTIMIZED };

      const expected = { '00080018': { Value: ['<sopUid-1>'], vr: 'UI' } };
      await expect(server.fetchCod(wadorsUrl, headers, options)).resolves.toEqual(expected);
    });

    it('should return series metadata for wadors url for series metadata', async () => {
      server.setOptions({ domain: 'https://example.com' });
      const wadorsUrl =
        'https://example.com/<bucketName>/<bucketPrefixWith>/dicomweb/studies/<studyUid>/series/<seriesUid>/metadata';
      const headers = { 'Content-Type': 'application/json' };
      const options = { useSharedArrayBuffer: true, fetchType: Enums.FetchType.API_OPTIMIZED };

      const expected = [{ '00080018': { Value: ['<sopUid-1>'], vr: 'UI' } }];
      await expect(server.fetchCod(wadorsUrl, headers, options)).resolves.toEqual(expected);
    });

    it('should fetch thumbnail data for wadors url for thumbnail', async () => {
      server.setOptions({ domain: 'https://example.com' });
      const wadorsUrl =
        'https://example.com/<bucketName>/<bucketPrefixWith>/dicomweb/studies/<studyUid>/series/<seriesUid>/thumbnail';
      const headers = { 'Content-Type': 'application/octet-stream' };
      const options = { useSharedArrayBuffer: true, fetchType: Enums.FetchType.API_OPTIMIZED };
      const expected = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).buffer;
      const fetchFileMock = jest.spyOn(server, 'fetchFile');
      fetchFileMock.mockResolvedValueOnce(expected);

      await expect(server.fetchCod(wadorsUrl, headers, options)).resolves.toEqual(expected);
      expect(fetchFileMock).toHaveBeenCalledWith('https://example.com/<bucketName>/<bucketPrefix>/path/to/thumbnail', headers, {
        useSharedArrayBuffer: options.useSharedArrayBuffer
      });
    });

    it('should fetch frame data for wadors url for frame', async () => {
      server.setOptions({ domain: 'https://example.com' });
      const wadorsUrl =
        'https://example.com/<bucketName>/<bucketPrefixWith>/dicomweb/studies/<studyUid>/series/<seriesUid>/instances/<sopUid-1>/frames/2';
      const headers = { 'Content-Type': 'application/octet-stream' };
      const options = { useSharedArrayBuffer: true, fetchType: Enums.FetchType.BYTES_OPTIMIZED };
      const expected = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).buffer;
      const fetchFileMock = jest.spyOn(server, 'fetchFile');
      fetchFileMock.mockResolvedValueOnce(expected);

      await expect(server.fetchCod(wadorsUrl, headers, options)).resolves.toEqual(expected);
      expect(fetchFileMock).toHaveBeenCalledWith(
        'https://example.com/<bucketName>/<bucketPrefixWith>/dicomweb/studies/relative/url/to/the/file?bytes=220-310',
        headers,
        {
          useSharedArrayBuffer: options.useSharedArrayBuffer,
          fetchType: options.fetchType,
          offsets: { startByte: 220, endByte: 310 }
        }
      );
    });
  });

  describe('fetchFile', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if the request types is not API_Optimzed or Bytes_Optimized', async () => {
      const fileUrl = 'fileUrl';
      const headers = { 'Content-Type': 'application/octet-stream' };
      const options = {
        offsets: { startByte: 20, endByte: 100 },
        useSharedArrayBuffer: true,
        fetchType: 'Invalid_Type'
      };

      // @ts-ignore
      await expect(server.fetchFile(fileUrl, headers, options)).rejects.toThrow(
        'CodDicomWebServer.ts: Offsets is needed in bytes optimized fetching'
      );
    });

    it('should throw an error if the maxFetchSize has been exceeded', async () => {
      const fileUrl = 'fileUrl';
      const headers = { 'Content-Type': 'application/octet-stream' };
      const options = {
        offsets: { startByte: 20, endByte: 100 },
        useSharedArrayBuffer: true,
        fetchType: Enums.FetchType.BYTES_OPTIMIZED
      };
      server.setOptions({ maxWorkerFetchSize: 20 });
      fileManagerGetTotalSize.mockReturnValueOnce(23);

      // @ts-ignore
      await expect(server.fetchFile(fileUrl, headers, options)).rejects.toThrow(
        'CodDicomWebServer.ts: Maximum size(20) for fetching files reached'
      );
    });

    it('should return the file if cached in the fileManager', async () => {
      const fileUrl = 'fileUrl';
      const headers = { 'Content-Type': 'application/octet-stream' };
      const options = {
        offsets: { startByte: 20, endByte: 100 },
        useSharedArrayBuffer: true,
        fetchType: Enums.FetchType.API_OPTIMIZED
      };
      const expected = Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      fileManagerGet.mockReturnValueOnce(expected);

      await expect(server.fetchFile(fileUrl, headers, options)).resolves.toEqual(expected.buffer);
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should delete a series instance', () => {
      const seriesInstanceUID = '1.2.3.4';

      server.addFileUrl(seriesInstanceUID, 'fileUrl');
      server.delete(seriesInstanceUID);

      expect(fileManagerRemove).toHaveBeenCalledTimes(1);
    });

    it('should not delete any series instance if the seriesUidFileUrls is empty', () => {
      const seriesInstanceUID = '1.2.3.4';

      server.delete(seriesInstanceUID);
      expect(fileManagerRemove).toHaveBeenCalledTimes(0);
    });
  });

  describe('deleteAll', () => {
    it('should delete all series instances', () => {
      server.addFileUrl('1.2.3.4', 'fileUrl1');
      server.addFileUrl('1.2.4', 'fileUrl2');
      server.addFileUrl('1.2.4', 'fileUrl3');
      server.addFileUrl('1.2.3.4', 'fileUrl3');
      server.deleteAll();

      expect(fileManagerRemove).toHaveBeenCalledTimes(4);
    });
  });

  describe('parseMetadata', () => {
    it('should throw error for invalid metadata', () => {
      // @ts-ignore
      const metadata: JsonMetadata = { invalid: 'metadata' };
      const type = Enums.RequestType.INSTANCE_METADATA;
      const sopInstanceUID = '1.2.3.4';
      expect(() => server.parseMetadata(metadata, type, sopInstanceUID)).toThrow(
        "Cannot read properties of undefined (reading 'instances')"
      );
    });

    it('should parse instance metadata', () => {
      const metadata: JsonMetadata = {
        // @ts-ignore
        cod: { instances: { '1.2.3.4': { metadata: { some: 'metadata', '00080018': { vr: 'UI', Value: ['<sopUid-1>'] } } } } }
      };
      const type = Enums.RequestType.INSTANCE_METADATA;
      const sopInstanceUID = '<sopUid-1>';
      const result = server.parseMetadata(metadata, type, sopInstanceUID);
      expect(result).toEqual({ some: 'metadata', '00080018': { vr: 'UI', Value: ['<sopUid-1>'] } });
    });

    it('should parse series metadata', () => {
      const metadata: JsonMetadata = {
        cod: {
          instances: {
            // @ts-ignore
            '1.2.3.4': { metadata: { some: 'metadata1', '00080018': { vr: 'UI', Value: ['<sopUid-1>'] } } },
            // @ts-ignore
            '1.2.3.5': { metadata: { some: 'metadata2', '00080018': { vr: 'UI', Value: ['<sopUid-2>'] } } },
            // @ts-ignore
            '1.2.3.6': { metadata: { some: 'metadata3', '00080018': { vr: 'UI', Value: ['<sopUid-3>'] } } }
          }
        }
      };
      const type = Enums.RequestType.SERIES_METADATA;
      const sopInstanceUID = '1.2.3.4';
      const result = server.parseMetadata(metadata, type, sopInstanceUID);
      const expected = [
        { some: 'metadata1', '00080018': { vr: 'UI', Value: ['<sopUid-1>'] } },
        { some: 'metadata2', '00080018': { vr: 'UI', Value: ['<sopUid-2>'] } },
        { some: 'metadata3', '00080018': { vr: 'UI', Value: ['<sopUid-3>'] } }
      ];

      expect(result).toEqual(expected);
    });
  });
});
