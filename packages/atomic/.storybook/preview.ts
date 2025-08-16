import '@coveo/atomic/themes/coveo.css';
import {
  type Parameters,
  setCustomElementsManifest,
} from '@storybook/web-components-vite';
import {setStorybookHelpersConfig} from '@wc-toolkit/storybook-helpers';
import {render} from 'lit';
import customElements from '../custom-elements.json';
import {defineCustomElements} from '../dist/atomic/loader/index.js';

setCustomElementsManifest(customElements);

defineCustomElements();
setStorybookHelpersConfig({
  categoryOrder: [
    'attributes',
    'cssParts',
    'cssProps',
    'cssStates',
    'events',
    'methods',
    'properties',
    'slots',
  ],
});

export const parameters: Parameters = {
  options: {
    storySort: {
      order: ['Introduction'],
      method: 'alphabetical',
      locales: 'en-US',
    },
  },
  controls: {
    expanded: true,
  },
};

export const decorators = [
  (Story) => {
    const story = Story();

    if (story?._$litType$) {
      const container = document.createElement('div');

      render(story, container);

      const isTestMode =
        typeof window !== 'undefined' &&
        window.location.href.includes('localhost');

      if (!isTestMode) {
        disableAnalytics(container, [
          'atomic-recs-interface',
          'atomic-insight-interface',
          'atomic-search-interface',
          'atomic-commerce-interface',
          'atomic-commerce-recommendation-interface',
        ]);
      }

      return container;
    }
  },
];

function disableAnalytics(container, selectors) {
  selectors.forEach((selector) => {
    container.querySelectorAll(selector).forEach((element) => {
      element.setAttribute('analytics', 'false');
    });
  });
}
