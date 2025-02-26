export class CustomError extends Error {}

export class CustomErrorEvent extends Event {
  error: CustomError;
  message: string;

  constructor(message: string, error: CustomError) {
    super(message);
    this.message = message;
    this.error = error;
  }
}

export class CustomMessageEvent extends MessageEvent<{
  url: string;
  position: number;
  chunk?: Uint8Array;
  isAppending?: boolean;
  fileArraybuffer?: Uint8Array;
  offsets?: { startByte: number; endByte: number };
}> {}
