import {
  renderVdom,
  registerHost,
  getHostRef,
  h,
} from '@stencil/core/internal/client';

const rootElement = document.getElementById('root');
const storyRoot = document.createElement('div');
const searchInterface = document.createElement('atomic-search-interface');
storyRoot.appendChild(searchInterface);
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
  controls: {expanded: true, hideNoControlsWarning: true},
};
