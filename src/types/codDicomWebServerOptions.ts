type CodDicomWebServerOptions = {
  [key: string]: number | string | boolean;
  maxWorkerFetchSize: number;
  domain: string;
  enableLocalCache: boolean;
};

export type { CodDicomWebServerOptions };
