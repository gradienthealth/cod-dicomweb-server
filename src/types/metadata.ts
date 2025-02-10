/**
 * Metadata format stored in the metadata.json
 */
type JsonMetadata = {
  deid_study_uid: string;
  deid_series_uid: string;
  cod: {
    instances: Record<
      string,
      {
        metadata: InstanceMetadata;
        // The metadata will either have url or uri
        uri: string;
        url: string;
        headers: { start_byte: number; end_byte: number };
        offset_tables: {
          CustomOffsetTable?: number[];
          CustomOffsetTableLengths?: number[];
        };
        crc32c: string;
        size: number;
        original_path: string;
        dependencies: string[];
        diff_hash_dupe_paths: [string];
        version: string;
        modified_datetime: string;
      }
    >;
  };
  thumbnail: {
    version: string;
    uri: string;
    thumbnail_index_to_instance_frame: [string, number][];
    instances: Record<
      string,
      {
        frames: {
          thumbnail_index: number;
          anchors: {
            original_size: { width: number; height: number };
            thumbnail_upper_left: { row: number; col: number };
            thumbnail_bottom_right: { row: number; col: number };
          };
        }[];
      }
    >;
  };
};

type InstanceMetadata = Record<string, { vr?: string; Value?: unknown[]; BulkDataURI?: string; InlineBinary?: string }>;

type SeriesMetadata = InstanceMetadata[];

export type { InstanceMetadata, SeriesMetadata, JsonMetadata };
