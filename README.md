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

const server = new CodDicomWebServer();
const wadorsUrl = "https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb/studies/1.2.826.0.1.3680043.8.498.25373200666081576206661715880670310913/series/1.2.826.0.1.3680043.8.498.17065113110917795618106606234460323040/instances/1.3.6.1.4.1.14519.5.2.1.7009.2403.109731662822930985185381565631/frames/1";
const headers = {};

const result = await server.fetchCod( wadorsUrl, headers, { useSharedArrayBuffer: true, fetchType: FetchType.BYTES_OPTIMIZED, });

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
