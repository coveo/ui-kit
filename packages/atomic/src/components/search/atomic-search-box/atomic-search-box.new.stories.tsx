import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import {wrapInSearchInterface} from '@coveo/atomic/storybookUtils/search/search-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInSearchInterface(
  {
    accessToken: 'xx149e3ec9-786f-4c6c-b64f-49a403b930de',
    organizationId: 'fashioncoveodemocomgzh7iep8',
    search: {
      searchHub: 'MainSearch',
    },
  },
  true
);

const meta: Meta = {
  component: 'atomic-search-box',
  title: 'Atomic/Searchbox/atomic-search-box',
  id: 'atomic-search-box',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  args: {
    'attributes-textarea': true,
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-search-box',
};

export const RichSearchBox: Story = {
  name: 'With recent queries and instant results',
  args: {
    'slots-default': ` <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
      <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
      <atomic-search-box-instant-results
        image-size="small"
      ></atomic-search-box-instant-results>`,
  },
};
