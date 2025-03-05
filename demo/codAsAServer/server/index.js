const http = require('http');
const cluster = require('cluster');
const os = require('node:os');
const { handler } = require('./handler');

const PORT = 5000;
console.log(`Server listening on port :${PORT}`);
// const server = http.createServer(handler);

// server.listen(PORT, () => console.log(`Server listening on port :${PORT}`));

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);

  // Fork workers for each CPU core
  const numCPUs = os.availableParallelism();
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    console.log('Starting a new worker...');
    cluster.fork(); // Restart the worker
  });
} else {
  const server = http.createServer(handler);

  server.listen(PORT);

  console.log(`Worker process ${process.pid} started`);
}
