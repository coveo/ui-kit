import '@coveo/atomic/themes/coveo.css';
import type {Preview} from '@storybook/web-components-vite';
import {
  type Parameters,
  setCustomElementsManifest,
} from '@storybook/web-components-vite';
import {setStorybookHelpersConfig} from '@wc-toolkit/storybook-helpers';
import {render} from 'lit';
import {initialize, mswLoader} from 'msw-storybook-addon';
import {within} from 'shadow-dom-testing-library';
import customElements from '../custom-elements.json';
import {defineCustomElements} from '../dist/atomic/loader/index.js';

initialize(
  import.meta.env.DEV || import.meta.env.VITE_IS_CDN === 'true'
    ? {serviceWorker: {url: './mockServiceWorker.js'}}
    : {}
);

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
    'slots',
  ],
  hideArgRef: true,
});

export const loaders = [mswLoader];

export const parameters: Parameters = {
  options: {
    storySort: (a, b) => {
      const topOrder = [
        'Introduction',
        'Commerce',
        'Search',
        'Recommendations',
        'Insight',
        'Common',
      ];

      const getTopLevel = (story) => story.title.split('/')[0];

      const aTop = getTopLevel(a);
      const bTop = getTopLevel(b);

      const aIndex = topOrder.indexOf(aTop);
      const bIndex = topOrder.indexOf(bTop);

      // Top-level order
      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }

      // Commerce subfolder custom ordering
      if (aTop === 'Commerce' && bTop === 'Commerce') {
        const aParts = a.title.split('/').slice(1); // skip top-level
        const bParts = b.title.split('/').slice(1);

        // Define subfolder priority: Introduction -> Example Pages -> others
        const subPriority = ['Introduction', 'Example Pages'];

        const aPriority = subPriority.indexOf(aParts[0]);
        const bPriority = subPriority.indexOf(bParts[0]);

        if (aPriority !== bPriority) {
          // Introduction/Example Pages first, then others
          return (
            (aPriority === -1 ? subPriority.length : aPriority) -
            (bPriority === -1 ? subPriority.length : bPriority)
          );
        }

        // If same priority or both other folders, sort alphabetically
        return aParts.join('/').localeCompare(bParts.join('/'), 'en-US');
      }

      // Fallback alphabetical for all other stories
      return a.title.localeCompare(b.title, 'en-US');
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
  chromatic: {disableSnapshot: true},
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

      return story;
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

const preview: Preview = {
  beforeEach({canvasElement, canvas}) {
    Object.assign(canvas, {...within(canvasElement)});
  },
  globals: {
    a11y: {manual: true},
  },
};

export default preview;
