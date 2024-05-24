import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInResult} from '@coveo/atomic/storybookUtils/result-wrapper';
import type {Meta, StoryObj} from '@storybook/web-components';

const {decorator, play} = wrapInResult({
  search: {
    preprocessSearchResponseMiddleware: (res) => {
      res.body.results.forEach(
        (r) => (r.raw['randomimage'] = 'https://picsum.photos/200')
      );
      return res;
    },
  },
});

const meta: Meta = {
  component: 'atomic-result-image',
  title: 'Atomic/ResultList/ResultImage',
  id: 'atomic-result-image',
  render: renderComponent,
  decorators: [decorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;
type Story = StoryObj;

export const FirstStory: Story = {
  name: 'atomic-result-image',
  args: {
    field: 'randomimage',
  },
};
