import '@coveo/atomic/dist/atomic/atomic.esm.js';
import '@coveo/atomic/dist/atomic/themes/coveo.css';
import {setCustomElementsManifest} from '@storybook/web-components';
import customElements from '../custom-elements.json';

setCustomElementsManifest(customElements);

export const parameters = {
  html: {
    root: '#code-root',
    removeComments: true,
    prettier: {
      tabWidth: 4,
      useTabs: false,
      htmlWhitespaceSensitivity: 'ignore',
    },
  },
  options: {
    storySort: {
      method: 'alphabetical-by-kind',
    },
  },
};
