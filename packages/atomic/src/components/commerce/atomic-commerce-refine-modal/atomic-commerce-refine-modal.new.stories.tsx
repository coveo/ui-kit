import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {userEvent} from '@storybook/test';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {within} from 'shadow-dom-testing-library';

const {decorator, play} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-refine-modal',
  title: 'Commerce/atomic-commerce-refine-modal',
  id: 'atomic-commerce-refine-toggle',
  render: renderComponent,
  decorators: [decorator],
  parameters: {
    ...parameters,
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

    await new Promise((resolve) => setTimeout(resolve, 500));
    await userEvent.click(refineToggle);
  },
};

export default meta;

export const DefaultModal: Story = {
  name: 'Default modal',
};
