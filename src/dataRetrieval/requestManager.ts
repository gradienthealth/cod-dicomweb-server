import { CustomError, CustomMessageEvent, CustomErrorEvent } from '../classes/customClasses';
import { ScriptObject } from '../types';

class RequestManager {
  private loaderRegistry: Record<
    string,
    {
      loaderObject: ScriptObject;
      listeners: Record<string, ((args: unknown) => unknown)[]>;
    }
  > = {};

  public register(loaderName: string, loaderObject: ScriptObject): void {
    try {
      if (!loaderObject) {
        throw new CustomError(`Loader object for ${loaderName} is not provided`);
      }

      this.loaderRegistry[loaderName] = {
        loaderObject,
        listeners: {}
      };
    } catch (error) {
      console.warn(error);
      throw new CustomError('throws');
    }
  }

  private listenerCallback = (loaderName: string, taskName: string, args: unknown) => {
    const listeners = this.loaderRegistry[loaderName]?.listeners[taskName];

    if (listeners) {
      listeners.forEach((listener) => listener({ data: args }));
    }
  };

  public async executeTask(loaderName: string, taskName: string, options: Record<string, unknown> | unknown): Promise<any> {
    const loaderObject = this.loaderRegistry[loaderName]?.loaderObject;
    if (!loaderObject) {
      throw new CustomError(`Loader ${loaderName} not registered`);
    }

    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return await loaderObject[taskName](options, (args: unknown) => this.listenerCallback(loaderName, 'message', args));
    } catch (error) {
      console.error(`Error executing task "${taskName}" on "${loaderName}":`, error);
      throw new CustomError(`Task "${taskName}" failed: ${(error as Error).message}`);
    }
  }

  public addEventListener(
    workerName: string,
    eventType: keyof WorkerEventMap,
    listener: (evt: CustomMessageEvent | CustomErrorEvent) => unknown
  ): void {
    const loaderObject = this.loaderRegistry[workerName];
    if (!loaderObject) {
      console.error(`Loader '${workerName}' is not registered.`);
      return;
    }

    if (!loaderObject.listeners[eventType]) {
      loaderObject.listeners[eventType] = [listener];
    } else {
      loaderObject.listeners[eventType].push(listener);
    }
  }

  public removeEventListener(
    workerName: string,
    eventType: keyof WorkerEventMap,
    listener: (evt: CustomMessageEvent | CustomErrorEvent) => unknown
  ): void {
    const loaderObject = this.loaderRegistry[workerName];
    if (!loaderObject) {
      console.error(`Loader '${workerName}' is not registered.`);
      return;
    }

    loaderObject.listeners[eventType] = (loaderObject.listeners[eventType] || []).filter(
      (existingListener) => existingListener !== listener
    );
  }

  public reset(): void {
    this.loaderRegistry = {};
  }
}

export default RequestManager;
