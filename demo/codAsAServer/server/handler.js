const { CodDicomWebServer, FetchType } = require('../../../dist/cjs/main');

const handler = async (req, res) => {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  try {
    // Parse URL
    const parsedUrl = new URL(req.url ?? '', `http://${req.headers.host}`);
    const { pathname: url, searchParams, hostname } = parsedUrl;

    const useSharedArrayBuffer = !!searchParams.get('useSharedArrayBuffer');
    const fetchTypeParam = searchParams.get('fetchType');
    let fetchType;

    switch (fetchTypeParam) {
      case 'API_OPTIMIZED':
        throw new Error('API_OPTIMIZED is not supported currently in server mode');
      case 'BYTES_OPTIMIZED':
        fetchType = FetchType.BYTES_OPTIMIZED;
        break;
    }

    console.log(`Request received - Host:${hostname}, Path(Url):${url}, Params:${searchParams}`);

    const codServer = new CodDicomWebServer();

    // Fetch data
    try {
      const result = await codServer.fetchCod(
        url,
        {},
        { useSharedArrayBuffer, fetchType: fetchType || FetchType.BYTES_OPTIMIZED }
      );
      console.log('result -- ', url.split('series/')[1], new Uint8Array(result).slice(0, 100).toString());
      res.statusCode = 200;

      if (result.byteLength) {
        if (url.includes('/frames/')) {
          const metadataUrl = url.split('frames/')[0] + 'metadata';
          const metadata = await codServer.fetchCod(metadataUrl);
          const transferSyntaxUID = metadata['00020010'].Value[0];
          res.setHeader('Content-Type', `transfer-syntax=${transferSyntaxUID}`);
        } else {
          res.setHeader('Content-Type', 'application/octet-stream');
        }

        res.end(new Uint8Array(result));
      } else {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
      }
    } catch (error) {
      console.log('error server -- ', error.stack);
      throw new Error('Error while fetching data - ' + error.message);
    } finally {
      codServer.deleteAll(); // Clean up
    }
  } catch (error) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        stack: error.stack
      })
    );
  }
};

module.exports = { handler };
