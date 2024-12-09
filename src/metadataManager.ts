import { createMetadataJsonUrl } from './classes/utils';
import type { JsonMetadata, MetadataUrlCreationParams } from './types';

const metadata: Record<string, JsonMetadata> = {};

export async function getMetadata(
  params: MetadataUrlCreationParams,
  headers: Record<string, string>,
): Promise<JsonMetadata | null> {
  const url = createMetadataJsonUrl(params);

  if (!url) {
    throw new Error('Error creating metadata json url');
  }

  if (metadata[url]) {
    return metadata[url];
  }

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    const data = await response.json();
    metadata[url] = data;
    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
