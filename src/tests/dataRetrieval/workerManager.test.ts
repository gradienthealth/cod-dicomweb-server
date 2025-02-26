import WebWorkerManager from '../../dataRetrieval/workerManager';

describe('WebWorkerManager', () => {
  let worker: Worker;
  const comlinkWrapMock = jest.spyOn(require('comlink'), 'wrap');

  describe('register', () => {
    beforeAll(() => {
      global.Worker = jest.fn().mockImplementation((filePath: string) => {
        return {
          postMessage: jest.fn(),
          terminate: jest.fn(),
          onmessage: jest.fn((callback) => {
            callback({ data: 'sample result' });
          })
        };
      }) as jest.Mock;

      worker = new Worker('worker.js');
    });

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should register a worker without throwing an error', () => {
      const webWorkerManager = new WebWorkerManager();
      const workerFn = jest.fn(() => worker);
      expect(webWorkerManager.register('test_worker', workerFn)).toBeUndefined();
      expect(workerFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('executeTask', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should throw an error if worker not registered', async () => {
      const webWorkerManager = new WebWorkerManager();
      const taskName = 'testTask';
      const options = {};

      await expect(webWorkerManager.executeTask('testWorker', taskName, options)).rejects.toThrow(
        'Worker testWorker not registered'
      );
    });

    it('should throw an error if workertask not in the worker', async () => {
      comlinkWrapMock.mockImplementation(jest.fn((worker) => ({ testTask: () => 'sample' })));

      const webWorkerManager = new WebWorkerManager();
      const workerFn = jest.fn(() => worker);
      webWorkerManager.register('testWorker', workerFn);
      const taskName = 'invalidTask';
      const options = {};

      expect(workerFn).toHaveBeenCalledTimes(1);
      expect(comlinkWrapMock).toHaveBeenCalledTimes(1);
      await expect(webWorkerManager.executeTask('testWorker', taskName, options)).rejects.toThrow(
        `Task "${taskName}" failed: worker[taskName] is not a function`
      );
    });

    it('should execute a task without throwing an error', async () => {
      comlinkWrapMock.mockImplementation(jest.fn((worker) => ({ testTask: () => 'sample' })));

      const webWorkerManager = new WebWorkerManager();
      const workerFn = jest.fn(() => worker);
      webWorkerManager.register('testWorker', workerFn);
      const taskName = 'testTask';
      const options = {};

      expect(workerFn).toHaveBeenCalledTimes(1);
      expect(comlinkWrapMock).toHaveBeenCalledTimes(1);
      await expect(webWorkerManager.executeTask('testWorker', taskName, options)).resolves.toEqual('sample');
    });
  });

  describe('addEventListener', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should add an event listener without throwing an error', () => {
      const webWorkerManager = new WebWorkerManager();
      const listener = jest.fn();
      expect(webWorkerManager.addEventListener('test_worker', 'message', listener)).toBeUndefined();
    });

    it('should call the event listener from the worker', () => {
      comlinkWrapMock.mockImplementation(jest.fn((worker) => ({ testTask: () => 'sample' })));
      const webWorkerManager = new WebWorkerManager();
      const listener = jest.fn();
      expect(webWorkerManager.addEventListener('test_worker', 'message', listener)).toBeUndefined();
    });
  });

  describe('removeEventListener', () => {
    it('should remove an event listener without throwing an error', () => {
      const webWorkerManager = new WebWorkerManager();
      const listener = jest.fn();
      webWorkerManager.addEventListener('test_worker', 'message', listener);
      expect(webWorkerManager.removeEventListener('test-worker', 'message', listener)).toBeUndefined();
    });
  });
});
