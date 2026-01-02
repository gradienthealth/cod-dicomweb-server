import { CustomError } from '../../classes/customClasses';
import { readFile, writeFile, createPartialFileName } from '../../fileAccessSystemUtils';

const filePartial = {
  async partial(
    args: {
      url: string;
      offsets?: { startByte: number; endByte: number };
      headers?: Record<string, string>;
      directoryHandle?: FileSystemDirectoryHandle;
    },
    callBack: (data: { url: string; fileArraybuffer: Uint8Array; offsets: { startByte: number; endByte: number } }) => void
  ): Promise<Uint8Array | Error> {
    const { url, offsets, headers, directoryHandle } = args;
    if (offsets?.startByte && offsets?.endByte) {
      headers['Range'] = `bytes=${offsets.startByte}-${offsets.endByte - 1}`;
    }

    const storageName = createPartialFileName(url, offsets);

    if (directoryHandle) {
      const file = (await readFile(directoryHandle, storageName, { offsets, isJson: false })) as ArrayBuffer;
      if (file) {
        const fileBuffer = new Uint8Array(file);
        callBack({ url, fileArraybuffer: fileBuffer, offsets });
        return fileBuffer;
      }
    }

    return await fetch(url, { headers })
      .then((response) => response.arrayBuffer())
      .then((data) => {
        const fileBuffer = new Uint8Array(data);
        callBack({ url, fileArraybuffer: fileBuffer, offsets });

        if (directoryHandle) {
          writeFile(directoryHandle, storageName, data);
        }

        return fileBuffer;
      })
      .catch((error) => {
        throw new CustomError('filePartial.ts: Error when fetching file: ' + error?.message);
      });
  }
};

export default filePartial;
