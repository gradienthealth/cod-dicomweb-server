type CodDicomWebServerOptions = {
  [key: string]: number | string | boolean;
  maxCacheSize: number;
  domain: string;
  enableLocalCache: boolean;
};

export type { CodDicomWebServerOptions };
