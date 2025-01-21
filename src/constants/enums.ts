export enum FetchType {
  /**
   * Fetch only the part of the file according to the offsets provided.
   */
  BYTES_OPTIMIZED,
  /**
   * Stream the file and returns the part of the file if offsets are provided.
   * Or returns the whole file.
   */
  API_OPTIMIZED
}

export enum RequestType {
  FRAME,
  THUMBNAIL,
  SERIES_METADATA,
  INSTANCE_METADATA
}
