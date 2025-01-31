import { CodDicomWebServer, FetchType } from '../dist/main';

const server = new CodDicomWebServer();
const wadorsUrl =
  'https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb/studies/1.2.826.0.1.3680043.8.498.25373200666081576206661715880670310913/series/1.2.826.0.1.3680043.8.498.17065113110917795618106606234460323040/instances/1.3.6.1.4.1.14519.5.2.1.7009.2403.109731662822930985185381565631/frames/1';
const headers = {};

document.getElementById('fetchDataButton').addEventListener('click', async () => {
  try {
    const result = await server.fetchCod(wadorsUrl, headers, {
      useSharedArrayBuffer: true,
      fetchType: FetchType.BYTES_OPTIMIZED
    });

    const contentDiv = document.getElementById('content');
    contentDiv.innerText = 'Fetched data (Uint8Array): ' + new Uint8Array(result).toString();
  } catch (error) {
    document.getElementById('content').innerText = 'Error fetching data: ' + error.message;
  }
});
