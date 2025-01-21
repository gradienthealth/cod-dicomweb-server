import * as apiOptimized from './apiOptimized';
import * as bytesOptimized from './bytesOptimized';

export function runBenchmark() {
  apiOptimized.runBenchmark();
  bytesOptimized.runBenchmark();
}
