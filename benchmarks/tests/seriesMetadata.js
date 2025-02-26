import { CodDicomWebServer } from '../../dist/umd/main';
import { testCases } from '../testDataDetails';
import { createBenchmarkTestOptions, getAuthorizationHeader } from '../utils';

export async function runBenchmark() {
  const suite = new Benchmark.Suite();
  const header = await getAuthorizationHeader();
  let server;

  const createFetchCodUrl = (domain, bucketName, bucketPrefix, studyUid, seriesUid) => {
    return `${domain}/${bucketName}/${bucketPrefix ? bucketPrefix + '/' : ''}studies/${studyUid}/series/${seriesUid}/metadata`;
  };

  suite
    .add(
      'CodDicomWebServer.fetchCod - series metadata, CT-MultiInstance',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid } = testCases['CT-MultiInstance'];
        await server.fetchCod(createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid), {
          ...(header ? { Authorization: header } : {})
        });
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - series metadata, MR-Multiframe',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid } = testCases['MR-Multiframe'];
        await server.fetchCod(createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid), {
          ...(header ? { Authorization: header } : {})
        });
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - series metadata, OPT-Multiframe',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid } = testCases['OPT-Multiframe'];
        await server.fetchCod(createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid), {
          ...(header ? { Authorization: header } : {})
        });
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - series metadata, MG-Multiframe',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid } = testCases['MG-Multiframe'];
        await server.fetchCod(createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid), {
          ...(header ? { Authorization: header } : {})
        });
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - series metadata, MG-Singleframe',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid } = testCases['MG-Singleframe'];
        await server.fetchCod(createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid), {
          ...(header ? { Authorization: header } : {})
        });
      })
    )
    .on('complete', function (event) {
      server = null;
      console.log(`\n${Array(125).fill('=').join('')}\n`);

      const cases = event.currentTarget.slice();
      cases.forEach((testCase) => {
        console.log(
          `${testCase.name} => mean = ${testCase.stats.mean.toFixed(4)}s \u00B1 ${testCase.stats.deviation.toFixed(4)}s (${
            testCase.stats.sample.length
          } samples)`
        );
      });
    })
    .run({ async: true });
}
