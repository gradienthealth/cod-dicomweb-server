import { createMetadataJsonUrl } from './classes/utils';
import type { JsonMetadata, MetadataUrlCreationParams } from './types';

class MetadataManager {
  private metadata: Record<string, JsonMetadata> = {};

  constructor() {}

  public getMetadataFromCache(url: string) {
    return this.metadata[url];
  }

  public async getMetadata(params: MetadataUrlCreationParams, headers: Record<string, string>): Promise<JsonMetadata | null> {
    const url = createMetadataJsonUrl(params);

    if (!url) {
      throw new Error('Error creating metadata json url');
    }

    const cachedMetadata = this.getMetadataFromCache(url);
    if (cachedMetadata) {
      return cachedMetadata;
    }

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      const data = await response.json();
      this.metadata[url] = data;
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default MetadataManager;
