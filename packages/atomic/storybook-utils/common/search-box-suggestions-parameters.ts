import type {Parameters} from '@storybook/web-components-vite';
import {parameters as commonParameters} from './common-meta-parameters.js';

export const parameters: Parameters = {
  ...commonParameters,
  docs: {
    ...commonParameters.docs,
    story: {
      ...commonParameters.docs?.story,
      height: '400px',
    },
  },
};
