import { CodDicomWebServer, FetchType } from '../dist/umd/main';

function appendResult(parentElement, url, result) {
  const urlDiv = document.createElement('div');
  urlDiv.style.width = '100%';
  urlDiv.style.overflowWrap = 'anywhere';
  urlDiv.style.marginTop = '15px';
  urlDiv.innerText = `Fetched data from ${url} : `;

  const fetchedDataDiv = document.createElement('div');
  fetchedDataDiv.style.overflowWrap = 'anywhere';
  fetchedDataDiv.style.width = '100%';
  fetchedDataDiv.innerText = result;
  fetchedDataDiv.style.display = 'none';

  const button = document.createElement('button');
  button.innerText = 'Show Fetched Data';
  button.onclick = function () {
    if (fetchedDataDiv.style.display === 'none') {
      fetchedDataDiv.style.display = 'block';
      button.innerText = 'Hide Fetched Data';
    } else {
      fetchedDataDiv.style.display = 'none';
      button.innerText = 'Show Fetched Data';
    }
  };

  parentElement.appendChild(urlDiv);
  parentElement.appendChild(button);
  parentElement.appendChild(fetchedDataDiv);
}

async function fetchFiles() {
  try {
    const server = new CodDicomWebServer();
    const headers = {};
    const contentDiv = document.getElementById('content');

    // The result is the pixeldata of the instance with mentioned sopUid.
    const multiInstanceWadoUrl =
      'https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb/studies/1.2.826.0.1.3680043.8.498.25373200666081576206661715880670310913/series/1.2.826.0.1.3680043.8.498.17065113110917795618106606234460323040/instances/1.2.826.0.1.3680043.8.498.12903905938468731988008479936141355889/frames/1';

    // The result is the pixeldata of only the mentioned frame.
    const multiframeWadorsUrl =
      'https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb/studies/1.2.826.0.1.3680043.8.498.58515363163019840470617254439211433238/series/1.2.826.0.1.3680043.8.498.44789272984044865387552033656108944196/instances/1.2.826.0.1.3680043.8.498.85959091954889636131137920671194527034/frames/20';

    // The result is the pixeldata of the dicom file in the direct url.
    const nonWadoRsUrl =
      'https://ohif-dicom-json-example.s3.amazonaws.com/LIDC-IDRI-0001/01-01-2000-30178/3000566.000000-03192/1-001.dcm';

    const instanceMetadataWadorsUrl =
      'https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb/studies/1.2.826.0.1.3680043.8.498.58515363163019840470617254439211433238/series/1.2.826.0.1.3680043.8.498.44789272984044865387552033656108944196/instances/1.2.826.0.1.3680043.8.498.85959091954889636131137920671194527034/metadata';

    const seriesMetadataWadorsUrl =
      'https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb/studies/1.2.826.0.1.3680043.8.498.25373200666081576206661715880670310913/series/1.2.826.0.1.3680043.8.498.17065113110917795618106606234460323040/metadata';

    const urls = [multiInstanceWadoUrl, multiframeWadorsUrl, nonWadoRsUrl, instanceMetadataWadorsUrl, seriesMetadataWadorsUrl];

    urls.forEach(async (url) => {
      try {
        const result = await server.fetchCod(url, headers, {
          useSharedArrayBuffer: false,
          fetchType: FetchType.BYTES_OPTIMIZED
        });
        const stringifiedResult = result.byteLength ? new Uint8Array(result).toString() : JSON.stringify(result);
        appendResult(contentDiv, url, stringifiedResult);
      } catch (error) {
        document.getElementById('errors').innerText =
          document.getElementById('errors').innerText + '\nError fetching data: ' + error.message;
      }
    });
  } catch (error) {
    document.getElementById('errors').innerText = 'Error fetching data: ' + error.message;
  }
}

document.getElementById('fetchDataButton').addEventListener('click', fetchFiles);
