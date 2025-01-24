import { Suite } from 'benchmark';

import { CodDicomWebServer } from '../../dist/main';
import { testCases } from '../testDataDetails';
import { createBenchmarkTestOptions, getAuthorizationHeader } from '../utils';

export async function runBenchmark() {
  const suite = Suite();
  const header = await getAuthorizationHeader();
  let server;

  const createFetchCodUrl = (domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid) => {
    return `${domain}/${bucketName}/${
      bucketPrefix ? bucketPrefix + '/' : ''
    }studies/${studyUid}/series/${seriesUid}/instances/${sopUid}/metadata`;
  };

  suite
    .add(
      'CodDicomWebServer.fetchCod - instance metadata, CT-MultiInstance, first instance',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid } = testCases['CT-MultiInstance'];
        await server.fetchCod(createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid[0]), 'imageId', {
          ...(header ? { Authorization: header } : {})
        });
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - instance metadata, CT-MultiInstance, all instances',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const promises = [];
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, numberOfFrames } = testCases['CT-MultiInstance'];

        for (let frameIndex = 0; frameIndex < numberOfFrames; frameIndex++) {
          promises.push(
            await server.fetchCod(
              createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid[frameIndex]),
              'imageId',
              { ...(header ? { Authorization: header } : {}) }
            )
          );
        }

        await Promise.all(promises);
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - instance metadata, MR-Multiframe',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid } = testCases['MR-Multiframe'];
        await server.fetchCod(createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid), 'imageId', {
          ...(header ? { Authorization: header } : {})
        });
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - instance metadata, OPT-Multiframe',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid } = testCases['OPT-Multiframe'];
        await server.fetchCod(createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid), 'imageId', {
          ...(header ? { Authorization: header } : {})
        });
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - instance metadata, MG-Multiframe',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid } = testCases['MG-Multiframe'];
        await server.fetchCod(createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid), 'imageId', {
          ...(header ? { Authorization: header } : {})
        });
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - instance metadata, MG-Singleframe',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid } = testCases['MG-Singleframe'];
        await server.fetchCod(createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid), 'imageId', {
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
