import RequestManager from '../../dataRetrieval/requestManager';

describe('RequestManager', () => {
  describe('register', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should register a loader without throwing an error', () => {
      const task = jest.fn();

      const requestManager = new RequestManager();
      const loaderScript = { run: task };
      expect(requestManager.register('test_loader', loaderScript)).toBeUndefined();
    });
  });

  describe('executeTask', () => {
    it('should throw an error if loader not registered', async () => {
      const requestManager = new RequestManager();
      const taskName = 'testTask';
      const options = {};

      await expect(requestManager.executeTask('test_loader', taskName, options)).rejects.toThrow(
        'Loader test_loader not registered'
      );
    });

    it('should throw an error if loadertask not in the loader', async () => {
      const task = jest.fn();

      const requestManager = new RequestManager();
      const loaderScript = { run: task };
      requestManager.register('test_loader', loaderScript);
      const taskName = 'invalidTask';
      const options = {};

      await expect(requestManager.executeTask('test_loader', taskName, options)).rejects.toThrow(
        `Task "${taskName}" failed: loaderObject[taskName] is not a function`
      );
    });

    it('should execute a task without throwing an error', async () => {
      const task = jest.fn().mockResolvedValue('sample');

      const requestManager = new RequestManager();
      const loaderScript = { testTask: task };
      requestManager.register('test_loader', loaderScript);
      const taskName = 'testTask';
      const options = {};

      await expect(requestManager.executeTask('test_loader', taskName, options)).resolves.toEqual('sample');
    });
  });

  describe('addEventListener', () => {
    it('should add an event listener without throwing an error', () => {
      const requestManager = new RequestManager();
      const task = jest.fn();
      const listener = jest.fn();
      const loaderScript = { run: task };
      requestManager.register('test_loader', loaderScript);

      expect(requestManager.addEventListener('test_loader', 'message', listener)).toBeUndefined();
    });
  });

  describe('removeEventListener', () => {
    it('should remove an event listener without throwing an error', () => {
      const requestManager = new RequestManager();
      const task = jest.fn();
      const listener = jest.fn();
      const loaderScript = { run: task };
      requestManager.register('test_loader', loaderScript);
      requestManager.addEventListener('test_loader', 'message', listener);

      expect(requestManager.removeEventListener('test_loader', 'message', listener)).toBeUndefined();
    });
  });
});
