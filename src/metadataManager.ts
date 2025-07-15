import { CustomError } from './classes/customClasses';
import { createMetadataJsonUrl } from './classes/utils';
import type { JsonMetadata, MetadataUrlCreationParams } from './types';

class MetadataManager {
  private metadataPromises: Record<string, Promise<JsonMetadata>> = {};

  constructor() {}

  public addDeidMetadata(jsonMetadata: JsonMetadata): void {
    const { deid_study_uid, deid_series_uid, cod } = jsonMetadata;

    if (!cod || !deid_study_uid || !deid_series_uid) {
      console.warn('Missing required metadata properties: cod, deid_study_uid, or deid_series_uid');
      return;
    }

    for (const deid_sop_uid in cod.instances) {
      const instance = cod.instances[deid_sop_uid];
      instance.metadata.DeidStudyInstanceUID = { Value: [deid_study_uid] };
      instance.metadata.DeidSeriesInstanceUID = { Value: [deid_series_uid] };
      instance.metadata.DeidSopInstanceUID = { Value: [deid_sop_uid] };
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
          this.addDeidMetadata(data);
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
