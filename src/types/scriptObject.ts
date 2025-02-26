type ScriptObject = {
  [variable: string]: unknown | ((...args: unknown[]) => unknown);
};

export type { ScriptObject };
