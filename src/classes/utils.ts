import constants, { Enums } from '../constants';
import type { JsonMetadata, MetadataUrlCreationParams, ParsedWadoRsUrlDetails } from '../types';
import { CustomError } from './customClasses';

export function parseWadorsURL(url: string, domain: string): ParsedWadoRsUrlDetails | undefined {
  if (!url.includes(constants.url.URL_VALIDATION_STRING)) {
    return;
  }

  const filePath = url.split(domain + '/')[1];

  const prefix = filePath.split('/studies')[0];
  const prefixParts = prefix.split('/');

  const bucketName = prefixParts[0];
  const bucketPrefix = prefixParts.slice(1).join('/');

  const imagePath = filePath.split(prefix + '/')[1];
  const imageParts = imagePath.split('/');

  const studyInstanceUID = imageParts[1];
  const seriesInstanceUID = imageParts[3];
  let sopInstanceUID = '',
    frameNumber = 1,
    type: Enums.RequestType;

  switch (true) {
    case imageParts.includes('thumbnail'):
      type = Enums.RequestType.THUMBNAIL;
      break;
    case imageParts.includes('metadata'):
      if (imageParts.includes('instances')) {
        sopInstanceUID = imageParts[5];
        type = Enums.RequestType.INSTANCE_METADATA;
      } else {
        type = Enums.RequestType.SERIES_METADATA;
      }
      break;
    case imageParts.includes('frames'):
      sopInstanceUID = imageParts[5];
      frameNumber = +imageParts[7];
      type = Enums.RequestType.FRAME;
      break;
    default:
      throw new CustomError('Invalid type of request');
  }

  return {
    type,
    bucketName,
    bucketPrefix,
    studyInstanceUID,
    seriesInstanceUID,
    sopInstanceUID,
    frameNumber
  };
}

export function getFrameDetailsFromMetadata(
  seriesMetadata: JsonMetadata,
  sopInstanceUID: string,
  frameIndex: number,
  bucketDetails: { domain: string; bucketName: string; bucketPrefix: string }
): {
  url?: string;
  startByte?: number;
  endByte?: number;
  thumbnailUrl: string | undefined;
  isMultiframe?: boolean;
} {
  if (!seriesMetadata || !seriesMetadata.cod?.instances) {
    throw new CustomError('Invalid seriesMetadata provided.');
  }

  if (frameIndex === null || frameIndex === undefined) {
    throw new CustomError('Frame index is required.');
  }

  const { domain, bucketName, bucketPrefix } = bucketDetails;
  let thumbnailUrl;

  if (seriesMetadata.thumbnail) {
    const thumbnailGsUtilUri = seriesMetadata.thumbnail.uri;
    thumbnailUrl = `${domain}/${thumbnailGsUtilUri.split('gs://')[1]}`;
  }

  const instanceFound = Object.entries(seriesMetadata.cod.instances).find(([key, instance]) => key === sopInstanceUID)?.[1];

  if (!instanceFound) {
    return { thumbnailUrl };
  }

  const { url, uri, headers: offsetHeaders, offset_tables } = instanceFound;
  const modifiedUrl = handleUrl(url || uri, domain, bucketName, bucketPrefix);

  const { CustomOffsetTable, CustomOffsetTableLengths } = offset_tables;

  let sliceStart: number | undefined,
    sliceEnd: number | undefined,
    isMultiframe = false;
  if (CustomOffsetTable?.length && CustomOffsetTableLengths?.length) {
    sliceStart = CustomOffsetTable[frameIndex];
    sliceEnd = sliceStart + CustomOffsetTableLengths[frameIndex];
    isMultiframe = true;
  }

  const { start_byte: fileStartByte, end_byte: fileEndByte } = offsetHeaders;

  const startByte = sliceStart !== undefined ? fileStartByte + sliceStart : fileStartByte;
  const endByte = sliceEnd !== undefined ? fileStartByte + sliceEnd : fileEndByte;

  return {
    url: modifiedUrl,
    startByte,
    endByte,
    thumbnailUrl,
    isMultiframe
  };
}

export function handleUrl(url: string, domain: string, bucketName: string, bucketPrefix: string): string {
  let modifiedUrl = url;

  const matchingExtension = constants.url.FILE_EXTENSIONS.find((extension) => url.includes(extension));

  if (matchingExtension) {
    const fileParts = url.split(matchingExtension);
    modifiedUrl = fileParts[0] + matchingExtension;
  }

  const filePath = modifiedUrl.split('studies/')[1];
  modifiedUrl = `${domain}/${bucketName}/${bucketPrefix ? bucketPrefix + '/' : ''}studies/${filePath}`;

  return modifiedUrl;
}

export function createMetadataJsonUrl(params: MetadataUrlCreationParams): string | undefined {
  const { domain = constants.url.DOMAIN, bucketName, bucketPrefix, studyInstanceUID, seriesInstanceUID } = params;

  if (!bucketName || !bucketPrefix || !studyInstanceUID || !seriesInstanceUID) {
    return;
  }

  return `${domain}/${bucketName}/${bucketPrefix}/studies/${studyInstanceUID}/series/${seriesInstanceUID}/metadata.json`;
}
