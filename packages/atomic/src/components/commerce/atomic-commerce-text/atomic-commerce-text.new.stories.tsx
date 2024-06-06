import {wrapInCommerceInterface} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-commerce-text',
  title: 'Atomic-Commerce/Product Template Components/Text',
  id: 'atomic-commerce-text',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
  argTypes: {
    value: {
      type: {
        name: 'string',
        required: true,
      },
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-text',
  args: {
    value: 'Atomic Commerce Text',
  },
};
