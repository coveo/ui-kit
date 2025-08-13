import type {Parameters} from '@storybook/web-components-vite';

export const parameters: Parameters = {
  layout: 'centered',
  controls: {expanded: true, hideNoControlsWarning: true},
  docs: {
    story: {autoplay: true},
  },
};
