import FileManager from '../fileManager';

describe('FileManager', () => {
  let fileManager: FileManager;

  beforeEach(() => {
    fileManager = new FileManager();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('should set file', () => {
    const url = 'test-url';
    const file = { data: new Uint8Array([1, 2, 3]), position: 3 };
    fileManager.set(url, file);

    expect(fileManager.get(url)).toEqual(file.data);
  });

  it('should get file', () => {
    const url = 'test-url';
    const file = { data: new Uint8Array([1, 2, 3]), position: 3 };
    fileManager.set(url, file);

    expect(fileManager.get(url)).toEqual(file.data);
  });

  it('should not get the file if it does not exist', () => {
    const url = 'test-url';

    expect(fileManager.get(url)).toBeNull();
  });

  it('should get file with offsets', () => {
    const url = 'test-url';
    const file = { data: new Uint8Array([1, 2, 3]), position: 3 };
    fileManager.set(url, file);
    const offsets = { startByte: 1, endByte: 2 };

    expect(fileManager.get(url, offsets)).toEqual(new Uint8Array([2]));
  });

  it('should not get the file with offsets if endByte is greaterthan position', () => {
    const url = 'test-url';
    const file = { data: new Uint8Array([1, 2, 3]), position: 3 };
    fileManager.set(url, file);
    const offsets = { startByte: 2, endByte: 4 };

    expect(fileManager.get(url, offsets)).toBeNull();
  });

  it('should get position', () => {
    const url = 'test-url';
    const file = { data: new Uint8Array([1, 2, 3]), position: 3 };
    fileManager.set(url, file);

    expect(fileManager.getPosition(url)).toBe(file.position);
  });

  it('should set position', () => {
    const url = 'test-url';
    const file = { data: new Uint8Array([1, 2, 3]), position: 3 };
    fileManager.set(url, file);
    const position = 10;
    fileManager.setPosition(url, position);

    expect(fileManager.getPosition(url)).toBe(position);
  });

  it('should not be able to set and get position if the file is not cached', () => {
    const url = 'test-url';
    const position = 10;
    fileManager.setPosition(url, position);

    expect(fileManager.getPosition(url)).toBeUndefined();
  });

  it('should append to file', () => {
    const url = 'test-url';
    const file = { data: new Uint8Array(6), position: 3 };
    file.data.set([1, 2, 3]);
    fileManager.set(url, file);
    const chunk = new Uint8Array([4, 5, 6]);
    fileManager.append(url, chunk, 6);

    expect(fileManager.get(url)).toEqual(new Uint8Array([1, 2, 3, 4, 5, 6]));
    expect(fileManager.getPosition(url)).toEqual(6);
  });

  it('should not append to file if position is falsy', () => {
    const url = 'test-url';
    const file = { data: new Uint8Array(6), position: 3 };
    file.data.set([1, 2, 3]);
    fileManager.set(url, file);
    const chunk = new Uint8Array([4, 5, 6]);
    // @ts-ignore
    fileManager.append(url, chunk, undefined);

    expect(fileManager.get(url)).toEqual(new Uint8Array([1, 2, 3, 0, 0, 0]));
    expect(fileManager.getPosition(url)).toEqual(3);
  });

  it('should get total size', () => {
    const url1 = 'test-url-1';
    const file1 = { data: new Uint8Array([1, 2, 3]), position: 3 };
    fileManager.set(url1, file1);
    const url2 = 'test-url-2';
    const file2 = { data: new Uint8Array([4, 5, 6]), position: 3 };
    fileManager.set(url2, file2);
    const url3 = 'test-url?bytes=1-10';
    const file3 = { data: new Uint8Array([4, 5, 6]), position: 3 };
    fileManager.set(url3, file3);

    expect(fileManager.getTotalSize()).toBe(9);
  });

  it('should remove file', () => {
    const url = 'test-url';
    const file = { data: new Uint8Array([1, 2, 3]), position: 3 };
    fileManager.set(url, file);
    fileManager.remove(url);

    expect(fileManager.get(url)).toBeNull();
  });

  it('should remove file but wont call getWebWorkerManager', () => {
    const url = 'test-url?bytes=1-10';
    const file = { data: new Uint8Array([1, 2, 3]), position: 3 };
    fileManager.set(url, file);
    fileManager.remove(url);

    expect(fileManager.get(url)).toBeNull();
  });

  it('should purge all files', () => {
    const url1 = 'test-url-1';
    const file1 = { data: new Uint8Array([1, 2, 3]), position: 3 };
    fileManager.set(url1, file1);
    const url2 = 'test-url-2';
    const file2 = { data: new Uint8Array([4, 5, 6]), position: 3 };
    fileManager.set(url2, file2);
    fileManager.purge();

    expect(fileManager.get(url1)).toBeNull();
    expect(fileManager.get(url2)).toBeNull();
    expect(fileManager.getTotalSize()).toEqual(0);
  });
});
