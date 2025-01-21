export async function getAuthorizationHeader() {
  const token = undefined; // This can also be a token. eg: 'Bearer <token>'
  return Promise.resolve(token);
}

export function createBenchmarkTestOptions(testFn) {
  return {
    defer: true,
    fn: async function (deferred) {
      try {
        await testFn();
      } catch (error) {
        console.error(error);
      } finally {
        deferred.resolve();
      }
    },
    initCount: 1,
    maxSamples: 10,
    maxTime: 4
  };
}
