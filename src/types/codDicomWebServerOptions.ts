type CodDicomWebServerOptions = {
  [key: string]: number | string | boolean;
  maxCacheSize: number;
  domain: string;
  enableOPFSCache: boolean;
};

export type { CodDicomWebServerOptions };
