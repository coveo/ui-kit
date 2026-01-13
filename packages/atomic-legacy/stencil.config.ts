// stencil.config.ts
import type {Config} from '@stencil/core';

export const config: Config = {
  taskQueue: 'async',
  sourceMap: true,
  tsconfig: 'tsconfig.json',
  outputTargets: [
    {
      externalRuntime: false,
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
    },
  ],
};
