import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator, play} = wrapInCommerceInterface({
  engineConfig: {organizationId: 'invalid-organization-id'},
});

const meta: Meta = {
  component: 'atomic-commerce-query-error',
  title: 'Atomic-Commerce/Interface Components/atomic-commerce-query-error',
  id: 'atomic-commerce-query-error',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-query-error',
};
