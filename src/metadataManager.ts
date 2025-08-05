import { CustomError } from './classes/customClasses';
import { createMetadataJsonUrl } from './classes/utils';
import type { JsonMetadata, MetadataUrlCreationParams } from './types';

class MetadataManager {
  private metadataPromises: Record<string, Promise<JsonMetadata>> = {};

  constructor() {}

  public addDeidMetadata(jsonMetadata: JsonMetadata, url: string): void {
    const { cod } = jsonMetadata;
    const [studyUID, _, seriesUID] = url.match(/studies\/(.*?)\/metadata/)?.[1].split('/') || [];

    if (!cod || !studyUID || !seriesUID) {
      console.warn('Missing required metadata properties: cod, studyUID, or seriesUID');
      return;
    }

    for (const sopUID in cod.instances) {
      const instance = cod.instances[sopUID];
      instance.metadata.DeidStudyInstanceUID = { Value: [studyUID] };
      instance.metadata.DeidSeriesInstanceUID = { Value: [seriesUID] };
      instance.metadata.DeidSopInstanceUID = { Value: [sopUID] };
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

    try {
      this.metadataPromises[url] = fetch(url, { headers })
        .then((response) => {
          if (!response.ok) {
            throw new CustomError(`Failed to fetch metadata: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          this.addDeidMetadata(data, url);
          return data;
        });

      return await this.metadataPromises[url];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default MetadataManager;
