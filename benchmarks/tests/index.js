import * as frame from './frame';
import * as instanceMetadata from './instanceMetadata';
import * as seriesMetadata from './seriesMetadata';
import * as thumbnail from './thumbnail';

export function runBenchmarks() {
  frame.runBenchmark();
  instanceMetadata.runBenchmark();
  seriesMetadata.runBenchmark();
  thumbnail.runBenchmark();
}
