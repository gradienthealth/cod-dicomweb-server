interface FileStreamingMessageEvent extends MessageEvent {
  data: {
    url: string;
    position: number;
    chunk?: Uint8Array;
    isAppending?: boolean;
    fileArraybuffer?: Uint8Array;
  };
}

export type { FileStreamingMessageEvent };
