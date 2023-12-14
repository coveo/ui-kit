import {
  renderVdom,
  registerHost,
  getHostRef,
  h,
} from '@stencil/core/internal/client';

const rootElement = document.getElementById('storybook-root');
const storyRoot = document.createElement('div');
const searchInterface = document.createElement('atomic-search-interface');
storyRoot.appendChild(searchInterface);
const recsInterface = document.createElement('atomic-recs-interface');
storyRoot.appendChild(recsInterface);
rootElement.parentElement.appendChild(storyRoot);

registerHost(storyRoot, {$flags$: 0, $tagName$: 'story-root'});
const hostRef = getHostRef(storyRoot);

export const decorators = [
  (Story) => {
    renderVdom(hostRef, Story());
    return '<div />';
  },
];

export const parameters = {
  options: {
    storySort: {
      method: 'alphabetical',
    },
  },
  controls: {expanded: true, hideNoControlsWarning: true},
  a11y: {
    element: 'atomic-search-interface',
    manual: true,
  },
  docs: {
    page: null,
    disable: true,
  },
  previewTabs: {
    'storybook/docs/panel': {
      hidden: true,
    },
  },
};
