import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {
  playExecuteFirstRequest,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator, play} = wrapInCommerceInterface({skipFirstRequest: true});

const meta: Meta = {
  component: 'atomic-commerce-facets',
  title: 'Commerce/Facets',
  id: 'atomic-commerce-facets',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  play: async (context) => {
    await play(context);
    await playExecuteFirstRequest(context);
  },
};

export const LoadingState: Story = {
  name: 'During loading',
  play: async (context) => {
    await play(context);
  },
};
