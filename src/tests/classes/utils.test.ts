import { parseWadorsURL, getFrameDetailsFromMetadata, handleUrl, createMetadataJsonUrl } from '../../classes/utils';
import { RequestType } from '../../constants/enums';
import type { JsonMetadata, MetadataUrlCreationParams, ParsedWadoRsUrlDetails } from '../../types';

describe('utils', () => {
  describe('parseWadorsURL', () => {
    it('should return undefined for invalid URL', () => {
      expect(parseWadorsURL('invalid-url', 'domain')).toBeUndefined();
    });

    it('should return undefined for Url without validation string(/dicomweb/)', () => {
      const url =
        'https://example.com/<bucketName>/<bucketPrefixWith-dicomweb>/studies/<studyUid>/series/<seriesUid>/instances/<sopUid>/frames/1';
      const domain = 'https://example.com';

      expect(parseWadorsURL(url, domain)).toBeUndefined();
    });

    it('should return parsed URL details for valid URL for frame', () => {
      const url =
        'https://example.com/<bucketName>/<bucketPrefixWith>/dicomweb/studies/<studyUid>/series/<seriesUid>/instances/<sopUid>/frames/1';
      const domain = 'https://example.com';
      const expected: ParsedWadoRsUrlDetails = {
        seriesInstanceUID: '<seriesUid>',
        sopInstanceUID: '<sopUid>',
        studyInstanceUID: '<studyUid>',
        type: RequestType.FRAME,
        bucketName: '<bucketName>',
        bucketPrefix: '<bucketPrefixWith>/dicomweb',
        frameNumber: 1
      };
      expect(parseWadorsURL(url, domain)).toEqual(expected);
    });

    it('should return parsed URL details for valid URL for thumbnail', () => {
      const url = 'https://example.com/<bucketName>/<bucketPrefixWith>/dicomweb/studies/<studyUid>/series/<seriesUid>/thumbnail';
      const domain = 'https://example.com';
      const expected: ParsedWadoRsUrlDetails = {
        seriesInstanceUID: '<seriesUid>',
        sopInstanceUID: '',
        studyInstanceUID: '<studyUid>',
        type: RequestType.THUMBNAIL,
        bucketName: '<bucketName>',
        bucketPrefix: '<bucketPrefixWith>/dicomweb',
        frameNumber: 1
      };
      expect(parseWadorsURL(url, domain)).toEqual(expected);
    });

    it('should return parsed URL details for valid URL for series metadata', () => {
      const url = 'https://example.com/<bucketName>/<bucketPrefixWith>/dicomweb/studies/<studyUid>/series/<seriesUid>/metadata';
      const domain = 'https://example.com';
      const expected: ParsedWadoRsUrlDetails = {
        seriesInstanceUID: '<seriesUid>',
        sopInstanceUID: '',
        studyInstanceUID: '<studyUid>',
        type: RequestType.SERIES_METADATA,
        bucketName: '<bucketName>',
        bucketPrefix: '<bucketPrefixWith>/dicomweb',
        frameNumber: 1
      };
      expect(parseWadorsURL(url, domain)).toEqual(expected);
    });

    it('should return parsed URL details for valid URL for instance metadata', () => {
      const url =
        'https://example.com/<bucketName>/<bucketPrefixWith>/dicomweb/studies/<studyUid>/series/<seriesUid>/instances/<sopUid>/metadata';
      const domain = 'https://example.com';
      const expected: ParsedWadoRsUrlDetails = {
        seriesInstanceUID: '<seriesUid>',
        sopInstanceUID: '<sopUid>',
        studyInstanceUID: '<studyUid>',
        type: RequestType.INSTANCE_METADATA,
        bucketName: '<bucketName>',
        bucketPrefix: '<bucketPrefixWith>/dicomweb',
        frameNumber: 1
      };
      expect(parseWadorsURL(url, domain)).toEqual(expected);
    });

    it('should throw error for invalid type of request', () => {
      const url = 'https://example.com/<bucketName>/<bucketPrefixWith>/dicomweb/studies/<studyUid>/series/<invalid-type>';
      const domain = 'https://example.com';

      expect(() => parseWadorsURL(url, domain)).toThrow('Invalid type of request');
    });
  });

  describe('getFrameDetailsFromMetadata', () => {
    let seriesMetadata: JsonMetadata;
    let bucketDetails: {
      domain: string;
      bucketName: string;
      bucketPrefix: string;
    };

    beforeEach(() => {
      seriesMetadata = {
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
      };

      bucketDetails = {
        domain: 'https://example.com',
        bucketName: '<bucketName>',
        bucketPrefix: '<bucketPrefix>'
      };
    });

    it('should throw error for empty seriesMetadata', () => {
      // @ts-ignore
      const seriesMetadata: JsonMetadata = {};
      const sopInstanceUID = '<sopUid-1>';
      const frameIndex = 1;
      const bucketDetails = {
        domain: 'https://example.com',
        bucketName: '<bucketName>',
        bucketPrefix: '<bucketPrefix>'
      };

      expect(() => getFrameDetailsFromMetadata(seriesMetadata, sopInstanceUID, frameIndex, bucketDetails)).toThrow(
        'Invalid seriesMetadata provided.'
      );
    });

    it('should throw error for seriesMetadata without cod', () => {
      // @ts-ignore
      delete seriesMetadata.cod;
      const sopInstanceUID = '<sopUid-1>';
      const frameIndex = 1;

      expect(() => getFrameDetailsFromMetadata(seriesMetadata, sopInstanceUID, frameIndex, bucketDetails)).toThrow(
        'Invalid seriesMetadata provided.'
      );
    });

    it('should throw error for seriesMetadata without cod instances', () => {
      // @ts-ignore
      seriesMetadata.cod = {};
      const sopInstanceUID = '<sopUid-1>';
      const frameIndex = 1;

      expect(() => getFrameDetailsFromMetadata(seriesMetadata, sopInstanceUID, frameIndex, bucketDetails)).toThrow(
        'Invalid seriesMetadata provided.'
      );
    });

    it('should throw error for null frameIndex', () => {
      const sopInstanceUID = '<sopUid-1>';
      const frameIndex = null;

      // @ts-ignore
      expect(() => getFrameDetailsFromMetadata(seriesMetadata, sopInstanceUID, frameIndex, bucketDetails)).toThrow(
        'Frame index is required.'
      );
    });

    it('should return an object with only thumbnailUrl without SOP instance UID', () => {
      const sopInstanceUID = undefined;
      const frameIndex = 1;

      // @ts-ignore
      expect(getFrameDetailsFromMetadata(seriesMetadata, sopInstanceUID, frameIndex, bucketDetails)).toEqual({
        thumbnailUrl: 'https://example.com/<bucketName>/<bucketPrefix>/path/to/thumbnail'
      });
    });

    it('should return an object with only thumbnailUrl for invalid SOP instance UID', () => {
      const sopInstanceUID = 'invalid-<sopUid>';
      const frameIndex = 1;

      expect(getFrameDetailsFromMetadata(seriesMetadata, sopInstanceUID, frameIndex, bucketDetails)).toEqual({
        thumbnailUrl: 'https://example.com/<bucketName>/<bucketPrefix>/path/to/thumbnail'
      });
    });

    it('should return multi frame details for valid metadata and SOP instance UID', () => {
      const sopInstanceUID = '<sopUid-1>';
      const frameIndex = 2;

      const expected = {
        url: 'https://example.com/<bucketName>/<bucketPrefix>/studies/relative/url/to/the/file',
        startByte: 318,
        endByte: 411,
        thumbnailUrl: 'https://example.com/<bucketName>/<bucketPrefix>/path/to/thumbnail',
        isMultiframe: true
      };
      expect(getFrameDetailsFromMetadata(seriesMetadata, sopInstanceUID, frameIndex, bucketDetails)).toEqual(expected);
    });

    it('should return single frame details for valid metadata and SOP instance UID( without customoffset tables )', () => {
      // @ts-ignore
      seriesMetadata.cod.instances = Object.fromEntries(
        Object.entries(seriesMetadata.cod.instances).map(([key, value]) => [key, { ...value, offset_tables: {} }])
      );
      const sopInstanceUID = '<sopUid-1>';
      const frameIndex = 2;

      const expected = {
        url: 'https://example.com/<bucketName>/<bucketPrefix>/studies/relative/url/to/the/file',
        startByte: 100,
        endByte: 419,
        thumbnailUrl: 'https://example.com/<bucketName>/<bucketPrefix>/path/to/thumbnail',
        isMultiframe: false
      };
      expect(getFrameDetailsFromMetadata(seriesMetadata, sopInstanceUID, frameIndex, bucketDetails)).toEqual(expected);
    });

    it('should return frame details without thumbnailurl for valid metadata without thumbnail property', () => {
      // @ts-ignore
      delete seriesMetadata.thumbnail;
      const sopInstanceUID = '<sopUid-1>';
      const frameIndex = 1;
      const expected = {
        url: 'https://example.com/<bucketName>/<bucketPrefix>/studies/relative/url/to/the/file',
        startByte: 220,
        endByte: 310,
        thumbnailUrl: undefined,
        isMultiframe: true
      };

      expect(getFrameDetailsFromMetadata(seriesMetadata, sopInstanceUID, frameIndex, bucketDetails)).toEqual(expected);
    });
  });

  describe('handleUrl', () => {
    it('should return handled URL for valid URL', () => {
      const url = 'studies/<studyUid>/series/<seriesUid>.tar:instances/<sopUid>.dcm';
      const domain = 'https://example.com';
      const bucketName = '<bucketName>';
      const bucketPrefix = '<bucketPrefix>';
      const expected = 'https://example.com/<bucketName>/<bucketPrefix>/studies/<studyUid>/series/<seriesUid>.tar';
      expect(handleUrl(url, domain, bucketName, bucketPrefix)).toEqual(expected);
    });

    it('should return handled URL for valid URL without bucketPrefix', () => {
      const url = 'studies/<studyUid>/series/<seriesUid>.tar:instances/<sopUid>.dcm';
      const domain = 'https://example.com';
      const bucketName = '<bucketName>';
      const bucketPrefix = undefined;
      const expected = 'https://example.com/<bucketName>/studies/<studyUid>/series/<seriesUid>.tar';
      // @ts-ignore
      expect(handleUrl(url, domain, bucketName, bucketPrefix)).toEqual(expected);
    });
  });

  describe('createMetadataJsonUrl', () => {
    it('should return undefined for invalid params', () => {
      const params: MetadataUrlCreationParams = {
        seriesInstanceUID: '',
        studyInstanceUID: '',
        domain: '',
        bucketName: '',
        bucketPrefix: ''
      };
      expect(createMetadataJsonUrl(params)).toBeUndefined();
    });

    it('should return metadata JSON URL for valid params', () => {
      const params: MetadataUrlCreationParams = {
        seriesInstanceUID: '<seriesUid>',
        studyInstanceUID: '<studyUid>',
        bucketName: '<<bucketName>>',
        bucketPrefix: '<<bucketPrefix>>'
      };
      const expected =
        'https://storage.googleapis.com/<<bucketName>>/<<bucketPrefix>>/studies/<studyUid>/series/<seriesUid>/metadata.json';
      expect(createMetadataJsonUrl(params)).toEqual(expected);
    });

    it('should return metadata JSON URL for valid params with custom domain', () => {
      const params: MetadataUrlCreationParams = {
        seriesInstanceUID: '<seriesUid>',
        studyInstanceUID: '<studyUid>',
        domain: 'https://example.com',
        bucketName: '<<bucketName>>',
        bucketPrefix: '<<bucketPrefix>>'
      };
      const expected = 'https://example.com/<<bucketName>>/<<bucketPrefix>>/studies/<studyUid>/series/<seriesUid>/metadata.json';
      expect(createMetadataJsonUrl(params)).toEqual(expected);
    });
  });
});
