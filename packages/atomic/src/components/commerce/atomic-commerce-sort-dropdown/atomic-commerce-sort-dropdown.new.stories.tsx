import customElements from '@/custom-elements.json';
import {defineCustomElements} from '@/dist/atomic/loader/index.js';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {
  setCustomElementsManifest,
  type Meta,
  type StoryObj as Story,
} from '@storybook/web-components';

setCustomElementsManifest(customElements);
defineCustomElements();

const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-sort-dropdown',
  title: 'Atomic Commerce/Atomic Commerce Sort Dropdown',
  id: 'atomic-commerce-sort-dropdown',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-sort-dropdown',
};
