import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {
  executeFirstRequestHook,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator, play} = wrapInCommerceInterface({
  skipFirstRequest: true,
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-facets',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-facets',
  title: 'Commerce/Facets',
  id: 'atomic-commerce-facets',
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

export const Default: Story = {
  play: async (context) => {
    await play(context);
    await executeFirstRequestHook(context);
  },
};

export const LoadingState: Story = {
  name: 'During loading',
  play: async (context) => {
    await play(context);
  },
};
