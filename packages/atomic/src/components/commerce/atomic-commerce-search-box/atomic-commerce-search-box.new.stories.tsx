import {wrapInCommerceInterface} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-search-box',
  title: 'Atomic-Commerce/Searchbox',
  id: 'atomic-commerce-search-box',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-search-box',
};

export const RichSearchBox: Story = {
  name: 'With suggestions and recent queries',
  args: {
    default: ` <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      <atomic-commerce-search-box-instant-products
        image-size="small"
      ></atomic-commerce-search-box-instant-products>`,
  },
};
