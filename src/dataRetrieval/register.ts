import { Enums } from '../constants';
import { getDataRetrievalManager } from './dataRetrievalManager';
import filePartial from './scripts/filePartial';
import fileStreaming from './scripts/fileStreaming';

export function register(workerNames: { fileStreamingScriptName: string; filePartialScriptName: string }): void {
  const { fileStreamingScriptName, filePartialScriptName } = workerNames;
  const dataRetrievalManager = getDataRetrievalManager();

  if (dataRetrievalManager.getDataRetrieverMode() === Enums.DataRetrieveMode.REQUEST) {
    dataRetrievalManager.register(fileStreamingScriptName, fileStreaming);
    dataRetrievalManager.register(filePartialScriptName, filePartial);
  } else {
    // fileStreaming worker
    const streamingWorkerFn = (): Worker =>
      new Worker(new URL('./workers/fileStreamingWorker', import.meta.url), {
        name: fileStreamingScriptName
      });

    dataRetrievalManager.register(fileStreamingScriptName, streamingWorkerFn);

    // filePartial worker
    const partialWorkerFn = (): Worker =>
      new Worker(new URL('./workers/filePartialWorker', import.meta.url), {
        name: filePartialScriptName
      });

    dataRetrievalManager.register(filePartialScriptName, partialWorkerFn);
  }
}
