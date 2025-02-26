import { expose } from 'comlink';
import fileStreaming from '../scripts/fileStreaming';

const fileStreamingWorker = {
  ...fileStreaming,
  stream: (args: any) => fileStreaming.stream(args, postMessage)
};

expose(fileStreamingWorker);
