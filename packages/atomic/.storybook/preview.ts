import '@/src/themes/coveo.css';
import '../storybook-utils/documentation/docs-layout.css';
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
          'Usage',
          [
            'Introduction',
            'Guides',
            [
              'Display results',
              [
                'Introduction',
                'Display as list or grid',
                'Display as table',
                'Display instant results',
                'Implement folding',
                'Use result sections',
              ],
              'Use generative answering',
              'Use layouts',
              'Content recommendations',
              'Standalone search box',
              'Frameworks',
              [
                'Introduction',
                'Use the React wrapper',
                'Use the Angular wrapper',
                'Usage in a Vue project',
              ],
            ],
            'Information',
            [
              'Manage your project',
              [
                'Introduction',
                'Create a project',
                'Download using CLI',
                'Deploy your project',
                'Use hosted page',
              ],
              'Usage Analytics',
              [
                'Overview',
                'Coveo UA',
                'Log view events with Coveo UA',
                'Event Protocol',
                'Log view events with Event Protocol',
              ],
              'Themes and visual customization',
              'Localization',
              'Accessibility',
              'Custom web components',
              'Custom query suggestions',
              'Access Headless through Atomic',
              'Modify requests and responses',
              'Use external components',
              'Change component properties',
            ],
          ],
          'Upgrade',
          ['v2 to v3', 'v1 to v2'],
          'Resources',
          [
            'Code samples',
            'Product lifecycle',
            'Versioned documentation',
            ['*'],
          ],
          'Reference',
          [
            'Search',
            ['Introduction', 'Example Pages', '*'],
            'Commerce',
            ['Introduction', 'Example Pages', '*'],
            'Recommendations',
            ['Introduction', 'Example Pages', '*'],
            'IPX',
            ['Introduction', 'Example Pages', '*'],
            'Insight',
            ['Introduction', 'Example Pages', '*'],
            'Common',
            ['Introduction', 'Example Pages', '*'],
          ],
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
    chromatic: {disableSnapshot: true},
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
