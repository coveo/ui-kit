import '@/src/themes/coveo.css';
import type {Preview} from '@storybook/web-components-vite';
import {setCustomElementsManifest} from '@storybook/web-components-vite';
import {setStorybookHelpersConfig} from '@wc-toolkit/storybook-helpers';
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
      // Always 'todo' here: the @coveo/atomic-a11y reporter (VitestA11yReporter)
      // gates CI at the run-end level via `process.exitCode`. We need every
      // axe result to flow through `task.meta.reports` for the JSON report,
      // which only happens when addon-a11y does NOT throw at test time.
      // - 'todo' - record violations, never throw; gating handled by the reporter
      // - 'error' - throws on violation but loses report data (do not use)
      // - 'off' - skip a11y checks entirely
      test: 'todo',
      options: {
        runOnly: {
          type: 'tag',
          values: [
            'wcag2a',
            'wcag21a',
            'wcag22a',
            'wcag2aa',
            'wcag21aa',
            'wcag22aa',
          ],
        },
      },
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
  beforeEach({canvasElement, canvas}) {
    Object.assign(canvas, {...within(canvasElement)});
  },
};

export default preview;
