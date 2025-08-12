import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-search-layout',
  title: 'Search/Search Layout',
  id: 'atomic-search-layout',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  args: {
    'slots-default': `<span>Layout content</span>`,
  },
};

export default meta;

export const Default: Story = {};
