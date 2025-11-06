import { get } from 'idb-keyval';
import { FILE_SYSTEM_ROUTES, IDB_DIR_HANDLE_KEY } from './constants/dataRetrieval';
import { JsonMetadata } from './types';

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

async function readJsonFile(directoryHandle: FileSystemDirectoryHandle, name: string): Promise<JsonMetadata> {
  return await directoryHandle
    .getFileHandle(name)
    .then((fileHandle) =>
      fileHandle
        .getFile()
        .then((file) => file.text())
        .then((metadataString) => JSON.parse(metadataString))
    )
    .catch((): null => null);
}

async function readArrayBufferFile(directoryHandle: FileSystemDirectoryHandle, name: string): Promise<ArrayBuffer> {
  return await directoryHandle
    .getFileHandle(name)
    .then((fileHandle) => fileHandle.getFile().then((file) => file.arrayBuffer()))
    .catch((): null => null);
}

export async function readFile(
  directoryHandle: FileSystemDirectoryHandle,
  name: string,
  options: { isJson?: boolean; offsets?: { startByte: number; endByte: number } } = {}
): Promise<ArrayBuffer | JsonMetadata> {
  if (!name) {
    return;
  }

  const pathParts = name.split('/');
  let currentDir = directoryHandle;

  try {
    for (let i = 0; i < pathParts.length - 1; i++) {
      currentDir = await currentDir.getDirectoryHandle(pathParts[i], { create: true });
    }

    const fileName = pathParts.at(-1);

    if (options.isJson) {
      return readJsonFile(currentDir, fileName);
    } else {
      return readArrayBufferFile(currentDir, fileName).catch(async () => {
        console.warn(`Error reading the file ${name} from partial folder, trying from full file`);

        if (options.offsets && pathParts.includes(FILE_SYSTEM_ROUTES.Partial)) {
          try {
            pathParts.splice(
              pathParts.findIndex((part) => part === FILE_SYSTEM_ROUTES.Partial),
              1
            );
            currentDir = directoryHandle;
            for (let i = 0; i < pathParts.length - 1; i++) {
              currentDir = await currentDir.getDirectoryHandle(pathParts[i], { create: true });
            }

            const convertedFileName = pathParts.at(-1).split('_')[0] + '.tar';
            const fileArraybuffer = await readArrayBufferFile(currentDir, convertedFileName);
            return fileArraybuffer.slice(options.offsets.startByte, options.offsets.endByte);
          } catch (error) {
            console.warn(`Error reading the file ${name}: ${error.message}`);
          }
        }
      });
    }
  } catch (error) {
    console.warn(`Error reading the file ${name}: ${error.message}`);
  }
}

export async function writeFile(
  directoryHandle: FileSystemDirectoryHandle,
  name: string,
  file: ArrayBuffer | JsonMetadata,
  isJson = false
): Promise<void> {
  try {
    const pathParts = name.split('/');
    let currentDir = directoryHandle;

    for (let i = 0; i < pathParts.length - 1; i++) {
      currentDir = await currentDir.getDirectoryHandle(pathParts[i], { create: true });
    }

    const fileName = pathParts.at(-1);
    const fileHandle = await currentDir.getFileHandle(fileName, { create: true });
    // @ts-ignore
    const fileWritable = await fileHandle.createWritable();
    if (isJson) {
      await fileWritable.write(JSON.stringify(file));
    } else {
      await fileWritable.write(file as ArrayBuffer);
    }
    await fileWritable.close();
  } catch (error) {
    console.warn(`Error writing the file ${name}: ${error.message}`);
  }
}

export function download(fileName: string, file: ArrayBuffer): boolean {
  try {
    const blob = new Blob([file], { type: 'application/x-tar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.warn(`Error downloading file - ${fileName}: ` + error.message);
    return false;
  }
}

export async function clearPartialFiles(): Promise<void> {
  const removePartialFolder = async (dirHandle: FileSystemDirectoryHandle): Promise<void> => {
    // @ts-ignore
    for await (const [name, handle] of dirHandle.entries()) {
      if (handle.kind === 'directory') {
        if (name.toLowerCase() === FILE_SYSTEM_ROUTES.Partial) {
          await dirHandle.removeEntry(name, { recursive: true }).catch((e) => console.warn(`Failed to remove ${name}:`, e));
        } else {
          // Recurse into other directories
          await removePartialFolder(handle);
        }
      }
    }
  };

  try {
    await removePartialFolder(directoryHandle);
  } catch (error) {
    console.warn(`Error clearing partial files: ${error.message}`);
  }
}

export function parseCachePath(url: string): string {
  const urlObj = new URL(url);
  const bucketPath = urlObj.pathname.match(/\/(.*?)\/studies/)[1];
  const [studyInstanceUID, _, seriesInstanceUID] = urlObj.pathname.match(/studies\/(.*?)(\.tar|\/metadata.json)/)[1].split('/');
  return `${bucketPath}/${studyInstanceUID}/${seriesInstanceUID}`;
}

export function createStreamingFileName(url: string): string {
  return `${parseCachePath(url)}/${url.split('series/')[1]}`;
}

export function createPartialFileName(url: string, offsets?: { startByte: number; endByte: number }): string {
  const seriesInstanceUID = url.match(/series\/(.*?).tar/)[1];
  const offsetPart = `${offsets ? `_${offsets?.startByte}_${offsets?.endByte}` : ''}`;
  return `${parseCachePath(url)}/${FILE_SYSTEM_ROUTES.Partial}/${seriesInstanceUID}${offsetPart}.dcm`;
}

export function createMetadataFileName(url: string): string {
  return `${parseCachePath(url)}/metadata.json`;
}
