import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface({
  search: {
    preprocessSearchResponseMiddleware: (res) => {
      res.body.results = [];
      res.body.queryCorrections = [
        {
          correctedQuery: 'test',
          wordCorrections: [
            {
              offset: 0,
              length: 4,
              originalWord: 'tset',
              correctedWord: 'test',
            },
          ],
        },
      ];
      return res;
    },
  },
});

const meta: Meta = {
  title: 'Atomic/DidYouMean',
  id: 'atomic-did-you-mean',
  component: 'atomic-did-you-mean',
  render: renderComponent,
  decorators: [decorator],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-did-you-mean',
};
