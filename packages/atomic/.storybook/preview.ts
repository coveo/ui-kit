import {setCustomElementsManifest} from '@storybook/web-components';
import customElements from '../custom-elements.json';

setCustomElementsManifest(customElements);

export const parameters = {
  html: {
    root: '#code-root', // default: #root
    prettier: {
      tabWidth: 4,
      useTabs: false,
      htmlWhitespaceSensitivity: 'ignore',
    },
  },
};
