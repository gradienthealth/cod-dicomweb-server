import { Suite } from 'benchmark';

import { CodDicomWebServer, FetchType } from '../../../dist/main';
import { testCases } from '../../testDataDetails';
import { createBenchmarkTestOptions, getAuthorizationHeader } from '../../utils';

export async function runBenchmark() {
  const suite = Suite();
  const header = await getAuthorizationHeader();
  let server;

  const createFetchCodUrl = (domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, frameNumber) => {
    return `dicomtar:${domain}/${bucketName}/${
      bucketPrefix ? bucketPrefix + '/' : ''
    }studies/${studyUid}/series/${seriesUid}/instances/${sopUid}/frames/${frameNumber}`;
  };

  suite
    .add(
      'CodDicomWebServer.fetchCod - frame, API_OPTIMIZED, CT-MultiInstance, first slice',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid } = testCases['CT-MultiInstance'];
        await server.fetchCod(
          createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid[0], 1),
          'imageId',
          { ...(header ? { Authorization: header } : {}) },
          { useSharedArrayBuffer: false, fetchType: FetchType.API_OPTIMIZED }
        );
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - frame, API_OPTIMIZED, CT-MultiInstance, all slices',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const promises = [];

        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, numberOfFrames } = testCases['CT-MultiInstance'];

        for (let frameIndex = 0; frameIndex < numberOfFrames; frameIndex++) {
          promises.push(
            server.fetchCod(
              createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid[frameIndex], 1),
              'imageId',
              { ...(header ? { Authorization: header } : {}) },
              { useSharedArrayBuffer: false, fetchType: FetchType.API_OPTIMIZED }
            )
          );
        }

        await Promise.all(promises);
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - frame, API_OPTIMIZED, MR-Multiframe, first slice',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid } = testCases['MR-Multiframe'];
        await server.fetchCod(
          createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, 1),
          'imageId',
          { ...(header ? { Authorization: header } : {}) },
          { useSharedArrayBuffer: false, fetchType: FetchType.API_OPTIMIZED }
        );
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - frame, API_OPTIMIZED, MR-Multiframe, all slices',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const promises = [];

        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, numberOfFrames } = testCases['MR-Multiframe'];

        for (let frameNumber = 1; frameNumber <= numberOfFrames; frameNumber++) {
          promises.push(
            server.fetchCod(
              createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, frameNumber),
              'imageId',
              { ...(header ? { Authorization: header } : {}) },
              { useSharedArrayBuffer: false, fetchType: FetchType.API_OPTIMIZED }
            )
          );
        }

        await Promise.all(promises);
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - frame, API_OPTIMIZED, OPT-Multiframe, first slice',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid } = testCases['OPT-Multiframe'];
        await server.fetchCod(
          createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, 1),
          'imageId',
          { ...(header ? { Authorization: header } : {}) },
          { useSharedArrayBuffer: false, fetchType: FetchType.API_OPTIMIZED }
        );
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - frame, API_OPTIMIZED, OPT-Multiframe, all slices',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const promises = [];

        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, numberOfFrames } = testCases['OPT-Multiframe'];

        for (let frameIndex = 0; frameIndex < numberOfFrames; frameIndex++) {
          promises.push(
            server.fetchCod(
              createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, frameIndex + 1),
              'imageId',
              { ...(header ? { Authorization: header } : {}) },
              { useSharedArrayBuffer: false, fetchType: FetchType.API_OPTIMIZED }
            )
          );
        }

        await Promise.all(promises);
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - frame, API_OPTIMIZED, MG-Multiframe, first slice',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid } = testCases['MG-Multiframe'];
        await server.fetchCod(
          createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, 1),
          'imageId',
          { ...(header ? { Authorization: header } : {}) },
          { useSharedArrayBuffer: false, fetchType: FetchType.API_OPTIMIZED }
        );
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - frame, API_OPTIMIZED, MG-Multiframe, all slices',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const promises = [];

        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, numberOfFrames } = testCases['MG-Multiframe'];

        for (let frameIndex = 0; frameIndex < numberOfFrames; frameIndex++) {
          promises.push(
            server.fetchCod(
              createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, frameIndex + 1),
              'imageId',
              { ...(header ? { Authorization: header } : {}) },
              { useSharedArrayBuffer: false, fetchType: FetchType.API_OPTIMIZED }
            )
          );
        }

        await Promise.all(promises);
      })
    )
    .add(
      'CodDicomWebServer.fetchCod - frame, API_OPTIMIZED, MG-Singleframe, first slice',
      createBenchmarkTestOptions(async () => {
        server = new CodDicomWebServer();
        const { domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid } = testCases['MG-Singleframe'];
        await server.fetchCod(
          createFetchCodUrl(domain, bucketName, bucketPrefix, studyUid, seriesUid, sopUid, 1),
          'imageId',
          { ...(header ? { Authorization: header } : {}) },
          { useSharedArrayBuffer: false, fetchType: FetchType.API_OPTIMIZED }
        );
      })
    )
    .on('complete', function (event) {
      server = null;
      console.log(`\n${Array(125).fill('=').join('')}\n`);

      const cases = event.currentTarget.slice();
      cases.forEach((testCase, index) => {
        if (testCase.name.includes('first slice') && index) {
          console.log(`${Array(125).fill('-').join('')}\n`);
        }

        console.log(
          `${testCase.name} => mean = ${testCase.stats.mean.toFixed(4)}s \u00B1 ${testCase.stats.deviation.toFixed(4)}s (${
            testCase.stats.sample.length
          } samples)`
        );
      });
    })
    .run({ async: true });
}
