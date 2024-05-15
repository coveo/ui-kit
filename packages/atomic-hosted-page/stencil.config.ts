import {Config} from '@stencil/core';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

function getHeadlessVersion(): string {
  return JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
    .peerDependencies['@coveo/headless'];
}
function getBuenoVersion(): string {
  return JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))
    .peerDependencies['@coveo/bueno'];
}

function externalizeHeadless() {
  switch (process.env.TARGET) {
    case 'cdn':
      return externalizeHeadlessForCDN();
    case 'npm':
    default:
      return externalizeHeadlessForNPM();
  }
}

function externalizeBueno() {
  switch (process.env.TARGET) {
    case 'cdn':
      return externalizeBuenoForCDN();
    case 'npm':
    default:
      return externalizeBuenoForNPM();
  }
}

function externalizeBuenoForCDN() {
  return {
    name: 'externalize-bueno',
    resolveId(id: string) {
      if (id.startsWith('@coveo/bueno')) {
        return {
          id: `/bueno/v${getBuenoVersion()}${id.replace('@coveo/bueno', '')}/bueno.esm.js`,
          external: 'absolute',
        };
      }
    },
  };
}

function externalizeBuenoForNPM() {
  return {
    name: 'externalize-headless',
    resolveId(id: string) {
      if (id.startsWith('@coveo/headless')) {
        return {
          id,
          external: true,
        };
      }
    },
  };
}

function externalizeHeadlessForNPM() {
  return {
    name: 'externalize-headless',
    resolveId(id: string) {
      if (id.startsWith('@coveo/headless')) {
        return {
          id,
          external: true,
        };
      }
    },
  };
}

function externalizeHeadlessForCDN() {
  const headlessVersion = getHeadlessVersion();
  return {
    name: 'externalize-headless',
    resolveId(id: string) {
      if (id.startsWith('@coveo/headless')) {
        return {
          id: `/headless/v${headlessVersion}${id.replace('@coveo/headless', '')}/headless.esm.js`,
          external: 'absolute',
        };
      }
    },
  };
}

export const config: Config = {
  namespace: 'atomic-hosted-page',
  taskQueue: 'async',
  sourceMap: true,
  devServer: {
    port: 3335,
    reloadStrategy: 'pageReload',
  },
  outputTargets: [
    {
      type: 'dist',
      collectionDir: null,
      esmLoaderPath: '../loader',
    },
    {
      type: 'www',
      serviceWorker: null,
      copy: [{src: 'pages', keepDirStructure: false}].filter((n) => n.src),
    },
  ],
  plugins: [externalizeBueno(), externalizeHeadless()],
};
