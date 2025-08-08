import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

//TODO here
async function initializeCommerceInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-commerce-interface');
  const commerceInterface = canvasElement.querySelector(
    'atomic-commerce-interface'
  );
  await commerceInterface!.initialize(getSampleCommerceEngineConfiguration());
}
const meta: Meta = {
  component: 'atomic-commerce-interface',
  title: 'Commerce/atomic-commerce-interface',
  id: 'atomic-commerce-interface',
  render: renderComponent,
  parameters,
  play: async (context) => {
    await initializeCommerceInterface(context.canvasElement);
    const searchInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    await searchInterface!.executeFirstRequest();
  },
  argTypes: {
    'attributes-language': {
      name: 'language',
      type: 'string',
    },
  },
  args: {
    'slots-default': `<span>Interface content</span>`,
  },
};

export default meta;

export const Default: Story = {};

export const SearchBeforeInit: Story = {
  tags: ['!dev'],
  play: async (context) => {
    const commerceInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    await customElements.whenDefined('atomic-commerce-interface');
    await commerceInterface!.executeFirstRequest();
  },
};
