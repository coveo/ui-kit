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
      storySort: (a, b) => {
        // Get the story hierarchy parts
        const aPath = a.title.split('/');
        const bPath = b.title.split('/');

        // Custom order for top-level sections
        const sectionOrder = [
          'Coveo Atomic Storybook',
          'Getting started',
          'Guides',
          'Reference',
          'Information',
        ];

        // Subfolders where Introduction should come first
        const introFirstSubfolders = [
          'Display results',
          'Frameworks',
          'Manage your project',
          'Usage Analytics',
        ];

        const aSection = aPath[0];
        const bSection = bPath[0];

        // Compare top-level sections
        if (aSection !== bSection) {
          const aIndex = sectionOrder.indexOf(aSection);
          const bIndex = sectionOrder.indexOf(bSection);

          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return aSection.localeCompare(bSection);
        }

        // Special handling for Guides subfolders with Introduction first
        if (aSection === 'Guides' && aPath.length > 2 && bPath.length > 2) {
          const aSubfolder = aPath[1];
          const bSubfolder = bPath[1];

          if (
            aSubfolder === bSubfolder &&
            introFirstSubfolders.includes(aSubfolder)
          ) {
            // Within these subfolders, Introduction goes first
            if (aPath[2] === 'Introduction') return -1;
            if (bPath[2] === 'Introduction') return 1;
          }
        }

        // Special handling for Reference subsections
        if (aSection === 'Reference' && aPath.length > 2 && bPath.length > 2) {
          const refSections = [
            'Search',
            'Commerce',
            'Recommendations',
            'IPX',
            'Insight',
            'Common',
          ];
          if (aPath[1] === bPath[1] && refSections.includes(aPath[1])) {
            // Within each Reference section, Introduction and Example Pages go first
            if (aPath[2] === 'Introduction') return -1;
            if (bPath[2] === 'Introduction') return 1;
            if (aPath[2] === 'Example Pages') return -1;
            if (bPath[2] === 'Example Pages') return 1;
          }
        }

        // Default alphabetical comparison
        return a.title.localeCompare(b.title);
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
