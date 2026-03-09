import '@coveo/atomic/themes/coveo.css';
import '../storybook-utils/documentation/edit-in-github.css';
import type {Preview} from '@storybook/web-components-vite';
import {setCustomElementsManifest} from '@storybook/web-components-vite';
import {setStorybookHelpersConfig} from '@wc-toolkit/storybook-helpers';
import {render} from 'lit';
import {initialize, mswLoader} from 'msw-storybook-addon';
import {within} from 'shadow-dom-testing-library';
import {create} from 'storybook/theming';
import {createEditInGithubElement} from '@/storybook-utils/documentation/create-edit-in-github-element';
import {resolveGithubPath} from '@/storybook-utils/documentation/resolve-github-path';
import customElements from '../custom-elements.json';
import {defineCustomElements} from '../dist/atomic/loader/index.js';
import {COVEO_PRIMARY, FONT_BASE, FONT_CODE} from './theme';

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

function disableAnalytics(container: HTMLElement, selectors: string[]) {
  selectors.forEach((selector) => {
    container.querySelectorAll(selector).forEach((element) => {
      element.setAttribute('analytics', 'false');
    });
  });
}

function ensureGlobalEditButton(
  githubPath?: string | null
): (HTMLDivElement & {href?: string}) | null {
  if (typeof document === 'undefined') return null;

  const existing = document.getElementById('sb-edit-in-github-global') as
    | (HTMLDivElement & {href?: string})
    | null;

  if (existing) {
    if (!githubPath) {
      existing.remove();
      return null;
    }
    existing.href = `https://github.com/coveo/ui-kit/blob/main/packages/atomic/src/components/${githubPath}`;
    return existing;
  }

  if (!githubPath) return null;

  const btn = createEditInGithubElement() as HTMLDivElement & {href?: string};
  btn.id = 'sb-edit-in-github-global';
  btn.href = `https://github.com/coveo/ui-kit/blob/main/packages/atomic/src/components/${githubPath}`;
  document.body.appendChild(btn);
  return btn;
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
      }

      return story;
    },

    (Story, context) => {
      const storyResult = Story();
      const isDocs = context?.viewMode === 'docs';
      const isIntroduction =
        context?.title?.endsWith('/Introduction') ||
        context?.title === 'Introduction';

      const githubPath =
        context?.parameters?.githubPath ??
        context?.parameters?.docs?.githubPath ??
        resolveGithubPath(context?.parameters?.fileName) ??
        null;

      ensureGlobalEditButton(
        githubPath && !isDocs && !isIntroduction ? githubPath : null
      );

      return storyResult;
    },
  ],
  beforeEach({canvasElement, canvas}) {
    Object.assign(canvas, {...within(canvasElement)});
  },
  globals: {
    a11y: {manual: true},
  },
};

export default preview;
