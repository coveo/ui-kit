import '@/src/themes/coveo.css';
import type {Preview} from '@storybook/web-components-vite';
import {setCustomElementsManifest} from '@storybook/web-components-vite';
import {setStorybookHelpersConfig} from '@wc-toolkit/storybook-helpers';
import {render} from 'lit';
import {initialize, mswLoader} from 'msw-storybook-addon';
import {within} from 'shadow-dom-testing-library';
import {create} from 'storybook/theming';
import customElements from '../custom-elements.json';
import {COVEO_PRIMARY, FONT_BASE, FONT_CODE} from './theme';

// For CDN builds, we want to use the "true" lib hosted on our CDN instead of bundling it through
// This allow us to have a more realistic test environment.
if (import.meta.env.VITE_IS_CDN === 'true') {
  const url = new URL(import.meta.url);
  url.pathname = `${url.pathname.split('/storybook/')[0]}/atomic.esm.js`;
  import(url.href);
}

initialize(
  import.meta.env.DEV || import.meta.env.VITE_IS_CDN === 'true'
    ? {serviceWorker: {url: './mockServiceWorker.js'}}
    : {}
);

setCustomElementsManifest(customElements);

setStorybookHelpersConfig({
  categoryOrder: [
    'attributes',
    'cssParts',
    'cssProps',
    'cssStates',
    'events',
    'methods',
    'slots',
  ],
  hideArgRef: true,
});

function disableAnalytics(container, selectors) {
  selectors.forEach((selector) => {
    container.querySelectorAll(selector).forEach((element) => {
      element.setAttribute('analytics', 'false');
    });
  });
}

const preview: Preview = {
  loaders: [mswLoader],
  parameters: {
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Coveo Atomic Storybook',
          'Search',
          ['Introduction', 'Example Pages', '*'],
          'Commerce',
          ['Introduction', 'Example Pages', '*'],
          'Recommendations',
          ['Introduction', 'Example Pages', '*'],
          'Insight',
          ['Introduction', 'Example Pages', '*'],
          'Common',
          ['Introduction', 'Example Pages', '*'],
          '*',
        ],
      },
    },
    controls: {
      expanded: true,
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },
    docs: {
      theme: create({
        base: 'light',
        colorPrimary: COVEO_PRIMARY,
        colorSecondary: COVEO_PRIMARY,
        fontBase: FONT_BASE,
        fontCode: FONT_CODE,
        appBg: '#ffffff',
        textColor: '#282829',
      }),
    },
  },
  decorators: [
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

        return story;
      }
    },
  ],
  beforeEach({canvasElement, canvas}) {
    Object.assign(canvas, {...within(canvasElement)});
  },
};

export default preview;
