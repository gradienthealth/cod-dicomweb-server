import { get } from 'idb-keyval';
import { FILE_SYSTEM_ROUTES, IDB_DIR_HANDLE_KEY } from './constants/dataRetrieval';

let directoryHandle: FileSystemDirectoryHandle;

export async function getDirectoryHandle(): Promise<FileSystemDirectoryHandle> {
  try {
    if (!directoryHandle) {
      directoryHandle = (await get(IDB_DIR_HANDLE_KEY)) as FileSystemDirectoryHandle;
    }

    if (!directoryHandle) {
      directoryHandle = await navigator.storage.getDirectory();
    }

    return directoryHandle;
  } catch (error) {
    console.warn(`Error getting directoryhandle: ${error.message}`);
  }
}

export async function readFile(
  directoryHandle: FileSystemDirectoryHandle,
  name: string,
  offsets?: { startByte: number; endByte: number }
): Promise<ArrayBuffer> {
  if (!name) {
    return;
  }

  let pathParts = name.split('/');
  let currentDir = directoryHandle;

  try {
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentDir = await currentDir.getDirectoryHandle(pathParts[i]);
    }

    const fileName = pathParts.at(-1);
    const fileHandle = await currentDir.getFileHandle(fileName);
    return await fileHandle.getFile().then((file) => file.arrayBuffer());
  } catch (error) {
    console.warn(`Error reading the file ${name}: ${error.message}`);

    if (offsets && pathParts[0] === FILE_SYSTEM_ROUTES.Partial) {
      try {
        const seriesInstanceUID = pathParts.at(-1).slice(0, name.lastIndexOf('.')).split('_')[0];
        pathParts = pathParts.slice(1);

        for (let i = 0; i < pathParts.length - 1; i++) {
          currentDir = await currentDir.getDirectoryHandle(pathParts[i]);
        }

        const fileHandle = await directoryHandle.getFileHandle(seriesInstanceUID + '.tar');
        const fileArraybuffer = await fileHandle.getFile().then((file) => file.arrayBuffer());
        return fileArraybuffer.slice(offsets.startByte, offsets.endByte);
      } catch (error) {
        console.warn(`Error reading the file ${name}: ${error.message}`);
      }
    }
  }
}

export async function writeFile(directoryHandle: FileSystemDirectoryHandle, name: string, file: ArrayBuffer): Promise<void> {
  try {
    const pathParts = name.split('/');
    let currentDir = directoryHandle;

    for (let i = 0; i < pathParts.length - 1; i++) {
      currentDir = await currentDir.getDirectoryHandle(pathParts[i], { create: true });
    }

    const fileName = pathParts[pathParts.length - 1];
    const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
    // @ts-ignore
    const fileWritable = await fileHandle.createWritable();
    await fileWritable.write(file);
    await fileWritable.close();
  } catch (error) {
    console.warn(`Error writing the file ${name}: ${error.message}`);
  }
}

export async function clearPartialFiles(): Promise<void> {
  try {
    await directoryHandle.removeEntry(FILE_SYSTEM_ROUTES.Partial, { recursive: true });
  } catch (error) {
    console.warn(`Error clearing partial files: ${error.message}`);
  }
}

export function createStreamingFileName(url: string): string {
  return url.split('series/')[1];
}

export function createPartialFileName(url: string, offsets?: { startByte: number; endByte: number }): string {
  const seriesInstanceUID = url.split('series/')[1].split('.tar')[0];
  const offsetPart = `${offsets ? `_${offsets?.startByte}_${offsets?.endByte}` : ''}`;
  return `${FILE_SYSTEM_ROUTES.Partial}/${seriesInstanceUID}${offsetPart}.dcm`;
}
