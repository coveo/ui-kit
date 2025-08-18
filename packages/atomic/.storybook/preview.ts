import '@coveo/atomic/themes/coveo.css';
import {setCustomElementsManifest} from '@storybook/web-components';
import {render} from 'lit';
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
      order: ['Introduction'],
      method: 'alphabetical',
      locales: 'en-US',
    },
  },
};

export const decorators = [
  (Story, context) => {
    const story = Story();

    if (story?._$litType$) {
      render(story, context.canvasElement);

      const isTestMode =
        typeof window !== 'undefined' &&
        window.location.href.includes('localhost');

      if (!isTestMode) {
        disableAnalytics(context.canvasElement, [
          'atomic-recs-interface',
          'atomic-insight-interface',
          'atomic-search-interface',
          'atomic-commerce-interface',
          'atomic-commerce-recommendation-interface',
        ]);
      }

      return context.canvasElement.children[0];
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
