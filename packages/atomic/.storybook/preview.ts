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

/**
 * Checks if the code is running in a test environment.
 * This is true for vitest story tests via @storybook/addon-vitest.
 */
function checkIsTestEnvironment(): boolean {
  // Check for vitest/storybook test environment variables
  if (typeof process !== 'undefined') {
    const env = process.env || {};
    if (env.VITEST || env.STORYBOOK_TEST || env.TEST) {
      return true;
    }
  }
  // Check for vitest global (set by @vitest/browser)
  if (typeof globalThis !== 'undefined' && '__vitest_browser__' in globalThis) {
    return true;
  }
  return false;
}

const isTestEnvironment = checkIsTestEnvironment();

// MSW is enabled by default in dev mode, or when running tests,
// but disabled in production builds unless explicitly enabled
const isMswEnabledByDefault =
  isTestEnvironment ||
  import.meta.env.DEV ||
  import.meta.env.VITE_IS_CDN === 'true';

// Track whether MSW has been initialized
let mswInitialized = false;

/**
 * Initialize MSW service worker.
 * This is called lazily when MSW is first enabled to support the toggle functionality.
 */
function initializeMsw() {
  if (mswInitialized) {
    return;
  }
  initialize({serviceWorker: {url: './mockServiceWorker.js'}});
  mswInitialized = true;
}

// Initialize MSW immediately in test environments or dev mode
if (isMswEnabledByDefault) {
  initializeMsw();
}

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

/**
 * Custom MSW loader that respects the msw global toggle.
 * - In test environments (vitest), MSW is always enabled
 * - In production builds, MSW is disabled by default
 * - In dev mode, MSW is enabled by default but can be toggled via toolbar
 */
const conditionalMswLoader: typeof mswLoader = async (context) => {
  // Always use MSW in test environments
  if (isTestEnvironment) {
    initializeMsw();
    return mswLoader(context);
  }

  // Check if MSW is enabled via the global toggle
  const isMswEnabled = context.globals?.msw ?? isMswEnabledByDefault;

  // If MSW is disabled, skip the loader
  if (!isMswEnabled) {
    return {};
  }

  // Initialize MSW if not already done (for dynamic enabling)
  initializeMsw();

  // Otherwise, use the standard MSW loader
  return mswLoader(context);
};

export const loaders = [conditionalMswLoader];

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

export const globalTypes = {
  msw: {
    name: 'MSW Mocking',
    description: 'Toggle MSW API mocking on/off',
    defaultValue: isMswEnabledByDefault,
    toolbar: {
      icon: 'lightning',
      title: 'MSW Mocking',
      items: [
        {value: true, title: 'MSW Enabled', icon: 'lightning'},
        {value: false, title: 'MSW Disabled', icon: 'lightningoff'},
      ],
      dynamicTitle: true,
    },
  },
};

const preview: Preview = {
  beforeEach({canvasElement, canvas}) {
    Object.assign(canvas, {...within(canvasElement)});
  },
  globals: {
    a11y: {manual: true},
    msw: isMswEnabledByDefault,
  },
};

export default preview;
