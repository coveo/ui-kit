import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface({
  search: {
    preprocessSearchResponseMiddleware: (res) => {
      res.body.results = [];
      return res;
    },
  },
});

const meta: Meta = {
  title: 'Atomic/NoResults',
  id: 'atomic-no-results',
  component: 'atomic-no-results',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-no-results',
};
