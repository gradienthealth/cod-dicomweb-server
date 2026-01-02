import { type Remote, wrap } from 'comlink';

import { CustomError, CustomErrorEvent, CustomMessageEvent } from '../classes/customClasses';

class WebWorkerManager {
  private workerRegistry: Record<string, { instance: Remote<Worker>; nativeWorker: Worker }> = {};

  public register(name: string, workerFn: () => Worker): void {
    try {
      const worker: Worker = workerFn();
      if (!worker) {
        throw new CustomError(`WorkerFn of worker ${name} is not creating a worker`);
      }

      this.workerRegistry[name] = {
        instance: wrap(worker),
        nativeWorker: worker
      };
    } catch (error) {
      console.warn(error);
    }
  }

  public async executeTask(workerName: string, taskName: string, options: Record<string, unknown> | unknown): Promise<any> {
    const worker = this.workerRegistry[workerName]?.instance;
    if (!worker) {
      throw new CustomError(`Worker ${workerName} not registered`);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await worker[taskName](options);
    } catch (error) {
      console.error(`Error executing task "${taskName}" on worker "${workerName}":`, error);
      throw new CustomError(`Task "${taskName}" failed: ${(error as Error).message}`);
    }
  }

  public addEventListener(
    workerName: string,
    eventType: keyof WorkerEventMap,
    listener: (evt: CustomMessageEvent | CustomErrorEvent) => unknown
  ): void {
    const worker = this.workerRegistry[workerName];
    if (!worker) {
      console.error(`Worker type '${workerName}' is not registered.`);
      return;
    }

    worker.nativeWorker.addEventListener(eventType, listener);
  }

  public removeEventListener(
    workerName: string,
    eventType: keyof WorkerEventMap,
    listener: (evt: CustomMessageEvent | CustomErrorEvent) => unknown
  ): void {
    const worker = this.workerRegistry[workerName];
    if (!worker) {
      console.error(`Worker type '${workerName}' is not registered.`);
      return;
    }

    worker.nativeWorker.removeEventListener(eventType, listener);
  }

  public reset(): void {
    this.workerRegistry = {};
  }
}

export default WebWorkerManager;
