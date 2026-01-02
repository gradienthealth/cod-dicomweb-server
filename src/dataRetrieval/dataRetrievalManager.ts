import { CustomError, CustomErrorEvent, CustomMessageEvent } from '../classes/customClasses';
import { Enums } from '../constants';
import { ScriptObject } from '../types';
import RequestManager from './requestManager';
import { isNodeEnvironment } from './utils/environment';
import WebWorkerManager from './workerManager';

class DataRetrievalManager {
  private dataRetriever: WebWorkerManager | RequestManager;
  private dataRetrieverMode: Enums.DataRetrieveMode;

  constructor() {
    if (isNodeEnvironment()) {
      this.dataRetriever = new RequestManager();
      this.dataRetrieverMode = Enums.DataRetrieveMode.REQUEST;
    } else {
      this.dataRetriever = new WebWorkerManager();
      this.dataRetrieverMode = Enums.DataRetrieveMode.WORKER;
    }
  }

  public getDataRetrieverMode(): Enums.DataRetrieveMode {
    return this.dataRetrieverMode;
  }

  public setDataRetrieverMode(mode: Enums.DataRetrieveMode) {
    const managers = {
      [Enums.DataRetrieveMode.WORKER]: WebWorkerManager,
      [Enums.DataRetrieveMode.REQUEST]: RequestManager
    };

    if (!(mode in managers)) {
      throw new CustomError('Invalid mode');
    }

    this.dataRetriever.reset();
    this.dataRetriever = new managers[mode]();
    this.dataRetrieverMode = mode;
  }

  public register(name: string, arg: (() => Worker) | ScriptObject) {
    // @ts-ignore
    this.dataRetriever.register(name, arg);
  }

  public async executeTask(loaderName: string, taskName: string, options: Record<string, unknown> | unknown): Promise<any> {
    return await this.dataRetriever.executeTask(loaderName, taskName, options);
  }

  public addEventListener(
    workerName: string,
    eventType: keyof WorkerEventMap,
    listener: (evt: CustomMessageEvent | CustomErrorEvent) => unknown
  ): void {
    this.dataRetriever.addEventListener(workerName, eventType, listener);
  }

  public removeEventListener(
    workerName: string,
    eventType: keyof WorkerEventMap,
    listener: (evt: CustomMessageEvent | CustomErrorEvent) => unknown
  ): void {
    this.dataRetriever.removeEventListener(workerName, eventType, listener);
  }

  public reset(): void {
    this.dataRetriever.reset();
  }
}

const dataRetrievalManager = new DataRetrievalManager();
Object.freeze(dataRetrievalManager);

export function getDataRetrievalManager(): DataRetrievalManager {
  return dataRetrievalManager;
}
