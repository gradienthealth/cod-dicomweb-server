import { CustomError } from '../../classes/customClasses';

const filePartial = {
  async partial(
    args: { url: string; offsets?: { startByte: number; endByte: number }; headers?: Record<string, string> },
    callBack: (data: { url: string; fileArraybuffer: Uint8Array; offsets: { startByte: number; endByte: number } }) => void
  ): Promise<void | Error> {
    const { url, offsets, headers } = args;
    if (offsets?.startByte && offsets?.endByte) {
      headers['Range'] = `bytes=${offsets.startByte}-${offsets.endByte - 1}`;
    }

    await fetch(url, { headers })
      .then((response) => response.arrayBuffer())
      .then((data) => callBack({ url, fileArraybuffer: new Uint8Array(data), offsets }))
      .catch((error) => {
        throw new CustomError('filePartial.ts: Error when fetching file: ' + error?.message);
      });
  }
};

export default filePartial;
