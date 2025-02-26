import { expose } from 'comlink';
import filePartial from '../scripts/filePartial';

const filePartialWorker = {
  ...filePartial,
  partial: (args: any) => filePartial.partial(args, postMessage)
};

expose(filePartialWorker);
