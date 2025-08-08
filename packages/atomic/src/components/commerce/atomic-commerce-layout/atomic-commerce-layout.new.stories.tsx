import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-layout',
  title: 'Commerce/atomic-commerce-layout',
  id: 'atomic-commerce-layout',
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
