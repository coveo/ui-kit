import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
// import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import './atomic-commerce-search-box-recent-queries';

// Wrap it in whatever interface/component you need
const {decorator, play} = wrapInSearchInterface();
// const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-search-box-recent-queries',
  title: 'AtomicCommerceSearchBoxRecentQueries',
  id: 'atomic-commerce-search-box-recent-queries',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-search-box-recent-queries',
};
