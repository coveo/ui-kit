// stencil.config.ts
import type {Config} from '@stencil/core';

export const config: Config = {
  taskQueue: 'async',
  sourceMap: true,
  tsconfig: 'tsconfig.json',
  outputTargets: [
    {
      type: 'dist-custom-elements',
      customElementsExportBehavior: 'auto-define-custom-elements',
    },
  ],
};
