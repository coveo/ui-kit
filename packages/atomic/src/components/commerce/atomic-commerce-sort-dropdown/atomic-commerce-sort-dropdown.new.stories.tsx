import {
  type Meta,
  type StoryObj as Story,
  setCustomElementsManifest,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import customElements from '@/custom-elements.json';
import {defineCustomElements} from '@/dist/atomic/loader/index.js';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

setCustomElementsManifest(customElements);
defineCustomElements();

const {decorator, play} = wrapInCommerceInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-sort-dropdown',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-sort-dropdown',
  title: 'Commerce/Sort Dropdown',
  id: 'atomic-commerce-sort-dropdown',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};
