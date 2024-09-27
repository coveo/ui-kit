import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic-storybook-utils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface({
  search: {
    preprocessSearchResponseMiddleware: (r) => {
      const [result] = r.body.results;
      result.title = 'Manage the Coveo In-Product Experiences (IPX)';
      result.clickUri = 'https://docs.coveo.com/en/3160';
      return r;
    },
  },
});
const meta: Meta = {
  component: 'atomic-result-list',
  title: 'Atomic/ResultList',
  id: 'atomic-result-list',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'List Display',
};

export const Grid: Story = {
  name: 'Grid Display',
  args: {
    'attributes-display': 'grid',
  },
};
