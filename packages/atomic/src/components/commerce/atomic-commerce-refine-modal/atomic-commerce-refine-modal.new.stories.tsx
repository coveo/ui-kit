import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {within} from 'shadow-dom-testing-library';
import {userEvent} from 'storybook/test';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-refine-modal',
  title: 'Commerce/Refine Modal',
  id: 'atomic-commerce-refine-toggle',
  render: renderComponent,
  decorators: [decorator],
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    docs: {
      ...parameters.docs,
      story: {
        ...parameters.docs?.story,
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
