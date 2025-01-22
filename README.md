# Cod DicomWeb Server

A wadors server proxy that get data from a Cloud Optimized Dicom format.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install this utility, follow these steps:

1. **Clone the repository**:

```bash
git clone https://github.com/gradienthealth/cod-dicomweb-server.git
cd cod-dicomweb-server
```

2. **Install dependencies**:

```bash
yarn install
```

3. **Build the code**:

```bash
yarn build
```

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

## Usage

1. **Open the Target repo in the code editor where this package needs to use and add the package**:

```bash
yarn add cod-dicomweb-server
```

2. **Use the methods of the package in any file in the target repo**:

```javaScript
import { CodDicomWebServer, FetchType } from 'cod-dicomweb-server';

const server = CodDicomWebServer();
const wadorsUrl = 'https://storage.googleapis.com/<bucket name>/<bucket prefix which end with /dicomweb>/studies/<studyUid>/series/<seriesUid>/instances/<sopUid>/frames/<frameNumber>';
const imageId = '<image scheme>:' + wadorsUrl;

const result = await server.fetchCod( wadorsUrl,
    imageId,
    headers,
    {
        useSharedArrayBuffer: true,
        fetchType: FetchType.BYTES_OPTIMIZED,
    }
)

console.log(result);
```

## Testing

You need to install all the dependencies and build the code to run the tests.

### Running Tests

```bash
yarn test
```

### Test Coverage

```bash
yarn coverage
```

### Benchmark tests

```bash
yarn benchmark
```

- The benchmark output will be displayed in the browser's debugger console.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch ( `git checkout -b feature/YourFeature` ).
3. Make your changes and commit them ( `git commit -m 'Add some feature'` ).
4. Push to the branch ( `git push origin feature/YourFeature` ).
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
