import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInCommerceInterface({skipFirstRequest: false});

const meta: Meta = {
  component: 'atomic-commerce-load-more-products',
  title: 'Commerce/atomic-commerce-load-more-products',
  id: 'atomic-commerce-load-more-products',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};
