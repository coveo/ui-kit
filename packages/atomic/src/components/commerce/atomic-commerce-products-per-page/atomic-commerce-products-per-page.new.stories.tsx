import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-products-per-page',
  title: 'Commerce/atomic-commerce-products-per-page',
  id: 'atomic-commerce-products-per-page',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};

export const WithCustomChoicesDisplayed: Story = {
  name: 'With custom choices displayed',
  args: {
    'attributes-choices-displayed': '2,5,10,25',
    'attributes-initial-choice': '2',
  },
};
