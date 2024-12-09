import { expose } from 'comlink';

const filePartial = {
  async partial(args: {
    url: string;
    headers?: Record<string, string>;
  }): Promise<ArrayBufferLike | Error> {
    const { url, headers } = args;

    return fetch(url, { headers })
      .then((response) => response.arrayBuffer())
      .catch((error) => {
        throw new Error(
          'filePartial.ts: Error when fetching file: ' + error?.message,
        );
      });
  },
};

expose(filePartial);
