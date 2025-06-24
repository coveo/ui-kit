import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
// import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

// Wrap it in whatever interface/component you need
const {decorator, play} = wrapInSearchInterface();
// const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-did-you-mean',
  title: 'AtomicCommerceDidYouMean',
  id: 'atomic-commerce-did-you-mean',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-did-you-mean',
};
