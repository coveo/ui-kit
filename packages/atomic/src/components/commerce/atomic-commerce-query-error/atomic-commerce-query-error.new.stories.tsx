import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInCommerceInterface} from '../../../../storybookUtils/commerce-interface-wrapper';

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
