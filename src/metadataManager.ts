import { ZSTDDecoder } from 'zstddec';
import { CustomError } from './classes/customClasses';
import { createMetadataJsonUrl } from './classes/utils';
import { medatata } from './constants';
import { createMetadataFileName, getDirectoryHandle, readFile, writeFile } from './fileAccessSystemUtils';
import type { InstanceMetadata, JsonMetadata, MetadataUrlCreationParams } from './types';

class MetadataManager {
  private metadataPromises: Record<string, Promise<JsonMetadata>> = {};
  private decoder?: ZSTDDecoder;
  private decoderInitPromise: Promise<boolean>;

  constructor() {
    this.decoder = null;
    const decoder = new ZSTDDecoder();

    this.decoderInitPromise = decoder
      .init()
      .then(() => {
        this.decoder = decoder;
        return true;
      })
      .catch((error) => {
        console.error('Failed to initialize ZSTD WASM module:', error);
        return false;
      });
  }

  public async addDeidMetadata(jsonMetadata: JsonMetadata, url: string): Promise<void> {
    const { cod } = jsonMetadata;
    const [studyUID, _, seriesUID] = url.match(/studies\/(.*?)\/metadata/)?.[1].split('/') || [];

    if (!cod || !studyUID || !seriesUID) {
      console.warn('Missing required metadata properties: cod, studyUID, or seriesUID');
      return;
    }

    for (const sopUID in cod.instances) {
      const instance = cod.instances[sopUID];

      // For V2, convert the metadata to InstanceMetadata format.
      if (instance.version === medatata.METADATA_VERSION.V2 && typeof instance.metadata === 'string') {
        const parsedMetadata = await this.decodeDecompressAndParse(instance.metadata);

        if (!parsedMetadata) {
          throw new Error('Failed to decode, decompress, or parse JSON');
        }

        instance.metadata = parsedMetadata;
      }

      const instanceMetadata = instance.metadata as InstanceMetadata;
      instanceMetadata.DeidStudyInstanceUID = { Value: [studyUID] };
      instanceMetadata.DeidSeriesInstanceUID = { Value: [seriesUID] };
      instanceMetadata.DeidSopInstanceUID = { Value: [sopUID] };
    }
  }

  public getMetadataFromCache(url: string) {
    return this.metadataPromises[url];
  }

  public async getMetadata(params: MetadataUrlCreationParams, headers: Record<string, string>): Promise<JsonMetadata | null> {
    const url = createMetadataJsonUrl(params);

    if (!url) {
      throw new CustomError('Error creating metadata json url');
    }

    const cachedMetadata = this.getMetadataFromCache(url);
    if (cachedMetadata) {
      return await cachedMetadata;
    }

    const directoryHandle = await getDirectoryHandle();
    const fileName = createMetadataFileName(url);
    const locallyCachedMetadata = (await readFile(directoryHandle, fileName, { isJson: true })) as JsonMetadata;
    if (locallyCachedMetadata) {
      return locallyCachedMetadata;
    }

    try {
      this.metadataPromises[url] = fetch(url, { headers })
        .then((response) => {
          if (!response.ok) {
            throw new CustomError(`Failed to fetch metadata: ${response.statusText}`);
          }
          return response.json();
        })
        .then(async (data) => {
          await this.addDeidMetadata(data, url);
          await writeFile(directoryHandle, fileName, data, true);
          return data;
        });

      return await this.metadataPromises[url];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  private async decodeDecompressAndParse(base64String: string): Promise<InstanceMetadata> {
    if (!base64String) {
      return null;
    }

    try {
      if (!(await this.decoderInitPromise)) {
        throw new Error('WASM Decoder is not initialized. Cannot decompress data.');
      }

      const compressedBytes = Uint8Array.from(atob(base64String), (c) => c.charCodeAt(0));
      const decompressedBytes = this.decoder.decode(compressedBytes);
      const jsonString = new TextDecoder().decode(decompressedBytes);
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to decode, decompress, or parse JSON:', error);
      return null;
    }
  }
}

export default MetadataManager;
