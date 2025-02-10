import { getWebWorkerManager } from './workerManager';

export function registerWorkers(
  workerNames: {
    fileStreamingWorkerName: string;
    filePartialWorkerName: string;
  },
  maxFetchSize: number
): void {
  const { fileStreamingWorkerName, filePartialWorkerName } = workerNames;
  const workerManager = getWebWorkerManager();

  // fileStreaming worker
  const streamingWorkerFn = (): Worker =>
    new Worker(new URL('./workers/fileStreamingWorker', import.meta.url), {
      name: fileStreamingWorkerName
    });

  workerManager.registerWorker(fileStreamingWorkerName, streamingWorkerFn);
  workerManager.executeTask(fileStreamingWorkerName, 'setMaxFetchSize', maxFetchSize);

  // filePartial worker
  const partialWorkerFn = (): Worker =>
    new Worker(new URL('./workers/filePartialWorker', import.meta.url), {
      name: filePartialWorkerName
    });

  workerManager.registerWorker(filePartialWorkerName, partialWorkerFn);
}
