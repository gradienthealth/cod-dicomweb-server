import { parseDicom } from 'dicom-parser';

import FileManager from '../fileManager';
import { getMetadata } from '../metadataManager';
import { getFrameDetailsFromMetadata, parseWadorsURL } from './utils';
import { getWebWorkerManager } from '../webWorker/workerManager';
import { registerWorkers } from '../webWorker/registerWorker';
import constants, { Enums } from '../constants';
import type {
  CodDicomWebServerOptions,
  InstanceMetadata,
  JsonMetadata,
  SeriesMetadata,
  CODRequestOptions,
  FileRequestOptions,
  FileStreamingMessageEvent
} from '../types';

class CodDicomWebServer {
  private filePromises: Record<string, Promise<void>> = {};
  private options: CodDicomWebServerOptions = {
    maxWorkerFetchSize: Infinity,
    domain: constants.url.DOMAIN
  };
  private fileManager;
  private seriesUidFileUrls: Record<string, string[]> = {};

  constructor(args: { maxWorkerFetchSize?: number; domain?: string } = {}) {
    const { maxWorkerFetchSize, domain } = args;

    this.options.maxWorkerFetchSize = maxWorkerFetchSize || this.options.maxWorkerFetchSize;
    this.options.domain = domain || this.options.domain;
    const fileStreamingWorkerName = constants.worker.FILE_STREAMING_WORKER_NAME;
    const filePartialWorkerName = constants.worker.FILE_PARTIAL_WORKER_NAME;
    this.fileManager = new FileManager({ fileStreamingWorkerName });

    registerWorkers({ fileStreamingWorkerName, filePartialWorkerName }, this.options.maxWorkerFetchSize);
  }

  public setOptions = (newOptions: CodDicomWebServerOptions): void => {
    Object.keys(newOptions).forEach((key) => {
      if (!newOptions[key] === undefined) {
        this.options[key] = newOptions[key];
      }
    });
  };

  public getOptions = (): CodDicomWebServerOptions => {
    return this.options;
  };

  private addFileUrl(seriesInstanceUID: string, url: string): void {
    if (this.seriesUidFileUrls[seriesInstanceUID]) {
      this.seriesUidFileUrls[seriesInstanceUID].push(url);
    } else {
      this.seriesUidFileUrls[seriesInstanceUID] = [url];
    }
  }

  public async fetchCod(
    wadorsUrl: string,
    imageId: string,
    headers: Record<string, string> | undefined = {},
    { useSharedArrayBuffer = false, fetchType = constants.Enums.FetchType.API_OPTIMIZED }: CODRequestOptions = {}
  ): Promise<ArrayBufferLike | InstanceMetadata | SeriesMetadata | undefined> {
    try {
      const parsedDetails = parseWadorsURL(wadorsUrl, this.options.domain);

      if (parsedDetails) {
        const { type, bucketName, bucketPrefix, studyInstanceUID, seriesInstanceUID, sopInstanceUID, frameNumber } = parsedDetails;

        const metadataJson = await getMetadata(
          {
            domain: this.options.domain,
            bucketName,
            bucketPrefix,
            studyInstanceUID,
            seriesInstanceUID
          },
          headers
        );

        if (!metadataJson) {
          throw new Error(`Metadata not found for ${wadorsUrl}`);
        }

        const {
          url: fileUrl,
          startByte,
          endByte,
          thumbnailUrl,
          isMultiframe
        } = getFrameDetailsFromMetadata(metadataJson, sopInstanceUID, frameNumber - 1, {
          domain: this.options.domain,
          bucketName,
          bucketPrefix
        });

        switch (type) {
          case Enums.RequestType.THUMBNAIL:
            this.addFileUrl(seriesInstanceUID, thumbnailUrl);

            return this.fetchFile(thumbnailUrl, headers, {
              useSharedArrayBuffer
            });

          case Enums.RequestType.FRAME: {
            let urlWithBytes: string = fileUrl;
            if (fetchType === Enums.FetchType.BYTES_OPTIMIZED) {
              urlWithBytes = `${fileUrl}?bytes=${startByte}-${endByte}`;
            }

            this.addFileUrl(seriesInstanceUID, fileUrl);

            return this.fetchFile(urlWithBytes, headers, {
              offsets: { startByte, endByte },
              useSharedArrayBuffer,
              fetchType
            }).then((arraybuffer) => {
              if (!arraybuffer?.byteLength) {
                throw new Error('File Arraybuffer is not found');
              }

              if (isMultiframe) {
                return arraybuffer;
              } else {
                const dataSet = parseDicom(new Uint8Array(arraybuffer));

                const pixelDataElement = dataSet.elements.x7fe00010;
                let { dataOffset, length } = pixelDataElement;
                if (pixelDataElement.hadUndefinedLength && pixelDataElement.fragments) {
                  ({ position: dataOffset, length } = pixelDataElement.fragments[0]);
                } else {
                  // Adding 8 bytes for 4 bytes tag + 4 bytes length for uncomppressed pixelData
                  dataOffset += 8;
                }

                return arraybuffer.slice(dataOffset, dataOffset + length);
              }
            });
          }
          case Enums.RequestType.SERIES_METADATA:
          case Enums.RequestType.INSTANCE_METADATA:
            return this.parseMetadata(metadataJson, type, sopInstanceUID);

          default:
            throw new Error(`Unsupported request type: ${type}`);
        }
      } else {
        return new Promise((resolve, reject) => {
          return this.fetchFile(wadorsUrl, headers, { useSharedArrayBuffer })
            .then((result) => {
              if (result instanceof ArrayBuffer) {
                try {
                  const dataSet = parseDicom(new Uint8Array(result));
                  const seriesInstanceUID = dataSet.string('0020000e');

                  !!seriesInstanceUID && this.addFileUrl(seriesInstanceUID, wadorsUrl);
                } catch (error) {
                  console.warn('There is some issue parsing the file.', error);
                }
              }
              resolve(result);
            })
            .catch((error) => reject(error));
        });
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  public async fetchFile(
    fileUrl: string,
    headers: Record<string, string>,
    { offsets, useSharedArrayBuffer = false, fetchType = constants.Enums.FetchType.API_OPTIMIZED }: FileRequestOptions = {}
  ): Promise<ArrayBufferLike | undefined> {
    const isBytesOptimized = fetchType === Enums.FetchType.BYTES_OPTIMIZED;
    const extractedFile = this.fileManager.get(fileUrl, isBytesOptimized ? undefined : offsets);

    if (extractedFile) {
      return new Promise<ArrayBufferLike>((resolveRequest, rejectRequest) => {
        try {
          resolveRequest(extractedFile.buffer);
        } catch (error) {
          rejectRequest(error);
        }
      });
    }

    const { maxWorkerFetchSize } = this.getOptions();
    const webWorkerManager = getWebWorkerManager();
    const { FILE_STREAMING_WORKER_NAME, FILE_PARTIAL_WORKER_NAME, THRESHOLD } = constants.worker;
    let tarPromise: Promise<void>;

    if (!this.filePromises[fileUrl]) {
      tarPromise = new Promise<void>((resolveFile, rejectFile) => {
        if (this.fileManager.getTotalSize() + THRESHOLD > maxWorkerFetchSize) {
          throw new Error(`fileStreaming.ts: Maximum size(${maxWorkerFetchSize}) for fetching files reached`);
        }

        const FetchTypeEnum = constants.Enums.FetchType;

        if (fetchType === FetchTypeEnum.API_OPTIMIZED) {
          const handleFirstChunk = (evt: FileStreamingMessageEvent | ErrorEvent): void => {
            if (evt instanceof ErrorEvent) {
              rejectFile(evt.error);
              throw evt.error;
            }

            const { url, position, fileArraybuffer } = evt.data;

            if (url === fileUrl && fileArraybuffer) {
              this.fileManager.set(url, { data: fileArraybuffer, position });

              webWorkerManager.removeEventListener(FILE_STREAMING_WORKER_NAME, 'message', handleFirstChunk);
            }
          };

          webWorkerManager.addEventListener(FILE_STREAMING_WORKER_NAME, 'message', handleFirstChunk);
          webWorkerManager
            .executeTask(FILE_STREAMING_WORKER_NAME, 'stream', {
              url: fileUrl,
              headers: headers,
              useSharedArrayBuffer
            })
            .then(() => {
              resolveFile();
            })
            .catch((error) => {
              webWorkerManager.removeEventListener(FILE_STREAMING_WORKER_NAME, 'message', handleFirstChunk);
              rejectFile(error);
            })
            .then(() => delete this.filePromises[fileUrl]);
        } else if (fetchType === FetchTypeEnum.BYTES_OPTIMIZED && offsets) {
          const { startByte, endByte } = offsets;
          headers['Range'] = `bytes=${startByte}-${endByte - 1}`;
          const url = fileUrl.split('?bytes=')[0];

          webWorkerManager
            .executeTask(FILE_PARTIAL_WORKER_NAME, 'partial', {
              url: url,
              headers: headers,
              useSharedArrayBuffer
            })
            .then((data) => {
              if (data) {
                this.fileManager.set(fileUrl, {
                  data: new Uint8Array(data),
                  position: data.byteLength
                });
                resolveFile();
              } else {
                rejectFile(new Error(`File - ${url} not found`));
              }
            })
            .catch((error) => {
              rejectFile(error);
            })
            .then(() => delete this.filePromises[fileUrl]);
        } else {
          rejectFile('Offsets is needed in bytes optimized fetching');
        }
      });

      this.filePromises[fileUrl] = tarPromise;
    } else {
      tarPromise = this.filePromises[fileUrl];
    }

    return new Promise<ArrayBufferLike | undefined>((resolveRequest, rejectRequest) => {
      let requestResolved = false;

      const handleChunkAppend = (evt: FileStreamingMessageEvent | ErrorEvent): void => {
        if (evt instanceof ErrorEvent) {
          rejectRequest(evt.message);
          throw evt.error;
        }

        const { url, position, chunk, isAppending } = evt.data;

        if (isAppending) {
          if (chunk) {
            this.fileManager.append(url, chunk, position);
          } else {
            this.fileManager.setPosition(url, position);
          }
        }

        if (!requestResolved && url === fileUrl && offsets && position > offsets.endByte) {
          try {
            const file = this.fileManager.get(url, offsets);
            requestResolved = true;
            resolveRequest(file?.buffer);
          } catch (error) {
            rejectRequest(error);
          }
        }
      };

      if (offsets && !isBytesOptimized) {
        webWorkerManager.addEventListener(FILE_STREAMING_WORKER_NAME, 'message', handleChunkAppend);
      }

      tarPromise
        .then(() => {
          if (!requestResolved) {
            const file = this.fileManager.get(fileUrl, isBytesOptimized ? undefined : offsets);
            requestResolved = true;
            resolveRequest(file?.buffer);
          }
        })
        .catch((error) => {
          rejectRequest(error);
        })
        .then(() => {
          webWorkerManager.removeEventListener(FILE_STREAMING_WORKER_NAME, 'message', handleChunkAppend);
        });
    });
  }

  public delete(seriesInstanceUID: string): void {
    const fileUrls = this.seriesUidFileUrls[seriesInstanceUID];
    if (fileUrls) {
      fileUrls.forEach((fileUrl) => {
        this.fileManager.remove(fileUrl);
      });
    }
    delete this.seriesUidFileUrls[seriesInstanceUID];
  }

  public deleteAll(): void {
    Object.values(this.seriesUidFileUrls).forEach((fileUrls) => {
      fileUrls.forEach((fileUrl) => {
        this.fileManager.remove(fileUrl);
      });
    });
    this.seriesUidFileUrls = {};
  }

  public parseMetadata(metadata: JsonMetadata, type: Enums.RequestType, sopInstanceUID: string): InstanceMetadata | SeriesMetadata {
    if (type === Enums.RequestType.INSTANCE_METADATA) {
      return metadata.cod.instances[sopInstanceUID].metadata;
    } else {
      return Object.values(metadata.cod.instances).map((instance) => instance.metadata);
    }
  }
}

export default CodDicomWebServer;
