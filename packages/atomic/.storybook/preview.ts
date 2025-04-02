import '@coveo/atomic/themes/coveo.css';
import {setCustomElementsManifest} from '@storybook/web-components';
import customElements from '../custom-elements.json';
import {defineCustomElements} from '../dist/atomic/loader/index.js';

setCustomElementsManifest(customElements);
defineCustomElements();

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
