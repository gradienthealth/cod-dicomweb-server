import { Enums } from '../constants';

type CODRequestOptions = {
  useSharedArrayBuffer?: boolean;
  fetchType?: Enums.FetchType;
};

type FileRequestOptions = CODRequestOptions & {
  offsets?: { startByte: number; endByte: number };
};

export type { CODRequestOptions, FileRequestOptions };
