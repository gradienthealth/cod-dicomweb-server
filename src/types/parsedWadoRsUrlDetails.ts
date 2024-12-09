import type { Enums } from '../constants';

type ParsedWadoRsUrlDetails = {
  type: Enums.RequestType;
  bucketName: string;
  bucketPrefix: string;
  studyInstanceUID: string;
  seriesInstanceUID: string;
  sopInstanceUID: string;
  frameNumber: number;
};

export type { ParsedWadoRsUrlDetails };
