import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-refine-toggle',
  title: 'Commerce/atomic-commerce-refine-toggle',
  id: 'atomic-commerce-refine-toggle',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};
