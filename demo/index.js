import { CodDicomWebServer, FetchType } from '../dist/main';

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

    const multiInstanceWadoUrl =
      'https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb/studies/1.2.826.0.1.3680043.8.498.25373200666081576206661715880670310913/series/1.2.826.0.1.3680043.8.498.17065113110917795618106606234460323040/instances/1.3.6.1.4.1.14519.5.2.1.7009.2403.109731662822930985185381565631/frames/1';
    // The result is the pixeldata of the instance with mentioned sopUid.
    const instancePixelData = await server.fetchCod(multiInstanceWadoUrl, headers, {
      useSharedArrayBuffer: true,
      fetchType: FetchType.BYTES_OPTIMIZED
    });
    appendResult(contentDiv, multiInstanceWadoUrl, new Uint8Array(instancePixelData).toString());

    const multiframeWadorsUrl =
      'https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb/studies/1.2.826.0.1.3680043.8.498.58515363163019840470617254439211433238/series/1.2.826.0.1.3680043.8.498.44789272984044865387552033656108944196/instances/1.3.6.1.4.1.5962.1.1.5017.1.2.1166546115.14677/frames/20';
    // The result is the pixeldata of only the mentioned frame.
    const framePixelData = await server.fetchCod(multiframeWadorsUrl, headers, {
      useSharedArrayBuffer: true,
      fetchType: FetchType.BYTES_OPTIMIZED
    });
    appendResult(contentDiv, multiframeWadorsUrl, new Uint8Array(framePixelData).toString());

    const instanceMetadataWadorsUrl =
      'https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb/studies/1.2.826.0.1.3680043.8.498.58515363163019840470617254439211433238/series/1.2.826.0.1.3680043.8.498.44789272984044865387552033656108944196/instances/1.3.6.1.4.1.5962.1.1.5017.1.2.1166546115.14677/metadata';
    const instanceMetadata = await server.fetchCod(instanceMetadataWadorsUrl, headers, {
      useSharedArrayBuffer: true,
      fetchType: FetchType.BYTES_OPTIMIZED
    });
    appendResult(contentDiv, instanceMetadataWadorsUrl, JSON.stringify(instanceMetadata));

    const seriesMetadataWadorsUrl =
      'https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb/studies/1.2.826.0.1.3680043.8.498.25373200666081576206661715880670310913/series/1.2.826.0.1.3680043.8.498.17065113110917795618106606234460323040/metadata';
    const seriesMetadata = await server.fetchCod(seriesMetadataWadorsUrl, headers, {
      useSharedArrayBuffer: true,
      fetchType: FetchType.BYTES_OPTIMIZED
    });
    appendResult(contentDiv, seriesMetadataWadorsUrl, JSON.stringify(seriesMetadata));
  } catch (error) {
    document.getElementById('content').innerText = 'Error fetching data: ' + error.message;
  }
}

document.getElementById('fetchDataButton').addEventListener('click', fetchFiles);
