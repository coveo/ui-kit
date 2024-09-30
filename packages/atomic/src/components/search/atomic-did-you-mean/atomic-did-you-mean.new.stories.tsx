import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
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
              // eslint-disable-next-line @cspell/spellchecker
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
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-did-you-mean',
};
