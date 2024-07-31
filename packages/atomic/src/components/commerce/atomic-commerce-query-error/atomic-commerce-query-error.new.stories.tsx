import {wrapInCommerceInterface} from '@coveo/atomic/storybookUtils/commerce/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

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
