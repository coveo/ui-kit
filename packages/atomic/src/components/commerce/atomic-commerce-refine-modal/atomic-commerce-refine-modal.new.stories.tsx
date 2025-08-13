import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {within} from 'shadow-dom-testing-library';
import {userEvent} from 'storybook/test';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters as commonParameters} from '@/storybook-utils/common/common-meta-parameters';

const {decorator, play} = wrapInCommerceInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-refine-modal',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-refine-modal',
  title: 'Commerce/Refine Modal',
  id: 'atomic-commerce-refine-toggle',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...commonParameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  globals: {
    layout: 'fullscreen',
    docs: {
      ...commonParameters.docs,
      story: {
        ...commonParameters.docs?.story,
        height: '1000px',
      },
    },
  },
  play: async (context) => {
    await play(context);
    const canvas = within(context.canvasElement);
    const refineToggle = await canvas.findByShadowText('Sort & Filter');

    await userEvent.click(refineToggle, {delay: 500});
  },
};

export default meta;

export const DefaultModal: Story = {
  name: 'Default modal',
};
