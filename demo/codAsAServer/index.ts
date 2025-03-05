// @ts-nocheck

import { Enums, imageLoader, RenderingEngine, type Types } from '@cornerstonejs/core';
import { wadors } from '@cornerstonejs/dicom-image-loader';
import {
  PanTool,
  StackScrollTool,
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
  addTool,
  Enums as csToolsEnums
} from '@cornerstonejs/tools';
import { createImageIdsAndCacheMetaData, initDemo, setTitleAndDescription } from '../../../../utils/demo/helpers';

import { api } from 'dicomweb-client';

// This is for debugging purposes
console.warn('Click on index.ts to open source code for this example --------->');

const { ViewportType } = Enums;

// ======== Set up page ======== //
setTitleAndDescription('Cod Dicomweb Server As A Server', 'Displays DICOM images fetched through the wadors proxy server.');

const content = document.getElementById('content');
const element = document.createElement('div');
element.id = 'cornerstone-element';
element.style.width = '700px';
element.style.height = '700px';

content.appendChild(element);
// ============================= //

// ======= Global variables ======= //
const viewportId = 'CT_STACK';
const renderingEngineId = 'myRenderingEngine';
let renderingEngine;
let toolGroup;
// ================================ //

/**
 * Runs the demo
 */
async function run() {
  // Init Cornerstone and related libraries
  await initDemo();

  // Add tools to Cornerstone3D
  addTool(WindowLevelTool);
  addTool(PanTool);
  addTool(ZoomTool);
  addTool(StackScrollTool);

  // Instantiate a rendering engine
  renderingEngine = new RenderingEngine(renderingEngineId);

  const toolGroupId = 'default';
  // Define a tool group, which defines how mouse events map to tool commands for
  // Any viewport using the group
  toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

  // Add tools to the tool group
  toolGroup.addTool(WindowLevelTool.toolName);
  toolGroup.addTool(PanTool.toolName);
  toolGroup.addTool(ZoomTool.toolName);
  toolGroup.addTool(StackScrollTool.toolName);

  toolGroup.setToolActive(WindowLevelTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }]
  });
  toolGroup.setToolActive(PanTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }]
  });
  toolGroup.setToolActive(ZoomTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }]
  });
  toolGroup.setToolActive(StackScrollTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Wheel }]
  });

  render();
}

// ========== Render the images ======= //
async function render() {
  // Create a stack viewport
  const viewportInput = {
    viewportId,
    type: ViewportType.STACK,
    element,
    defaultOptions: {
      background: [0.2, 0, 0.2] as Types.Point3
    }
  };

  renderingEngine.enableElement(viewportInput);
  toolGroup.addViewport(viewportId, renderingEngineId);

  // Get the stack viewport that was created
  const viewport = renderingEngine.getViewport(viewportId) as Types.IStackViewport;

  const codImagesIds: string[] = [];

  const codDomain = 'http://localhost:5000';
  const storageDomain = 'https://storage.googleapis.com/gradienthealth_cod_dicomweb_public_benchmark/v1/dicomweb';
  const wadoRsRoot = codDomain + '/' + storageDomain;

  const webClient = new api.DICOMwebClient({ url: wadoRsRoot });
  const client = {
    retrieveSeriesMetadata: async (studySearchOptions) => {
      const { studyInstanceUID, seriesInstanceUID } = studySearchOptions;
      return await webClient.retrieveSeriesMetadata(studySearchOptions).then((instances) => {
        // @ts-ignore
        instances.forEach((instance) => {
          const sopInstanceUID = instance['00080018'].Value[0];
          const imageId =
            'wadors:' +
            wadoRsRoot +
            '/studies/' +
            studyInstanceUID +
            '/series/' +
            seriesInstanceUID +
            '/instances/' +
            sopInstanceUID;

          const numberOfFrames = instance['00280008'].Value[0];

          if (numberOfFrames > 1) {
            for (let frame = 1; frame <= numberOfFrames; frame++) {
              const imageIdWithFrame = `${imageId}/frames/${frame}`;
              codImagesIds.push(imageIdWithFrame);
              wadors.metaDataManager.add(imageIdWithFrame, instance);
            }
          } else {
            codImagesIds.push(`${imageId}/frames/1`);
            wadors.metaDataManager.add(`${imageId}/frames/1`, instance);
          }
        });

        return instances;
      });
    }
  };

  // Get Cornerstone imageIds and fetch metadata into RAM
  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID: '1.2.826.0.1.3680043.8.498.12719158038798280733770732197410019086',
    SeriesInstanceUID: '1.2.826.0.1.3680043.8.498.74090794496407715574511749603067649403',
    wadoRsRoot,
    client
  });

  const stack = codImagesIds;

  await viewport.setStack(stack);
  Promise.all(imageLoader.loadAndCacheImages(stack));

  viewport.render();
}

run();
