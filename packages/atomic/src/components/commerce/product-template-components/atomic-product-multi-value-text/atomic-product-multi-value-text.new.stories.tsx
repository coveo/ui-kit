import {wrapInCommerceInterface} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-product-multi-value-text',
  title: 'Atomic-Commerce/Product Template Components/MultiValueText',
  id: 'atomic-product-multi-value-text',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-multi-value-text',
  args: {
    field: 'multi_value_field',
  },
};

export const WithMaxValuesToDisplay: Story = {
  name: 'With max values to display',
  args: {
    field: 'multi_value_field',
    'max-values-to-display': 2,
  },
};

export const WithCustomSlotValues: Story = {
  name: 'With custom slot values',
  args: {
    field: 'multi_value_field',
  },
  render: (args) => {
    const element = document.createElement('atomic-product-multi-value-text');
    Object.keys(args).forEach((key) => {
      element.setAttribute(key, args[key]);
    });
    const customSlot = document.createElement('span');
    customSlot.setAttribute('slot', 'product-multi-value-text-value-custom');
    customSlot.innerText = 'Custom Value';
    element.appendChild(customSlot);
    return element;
  },
};
