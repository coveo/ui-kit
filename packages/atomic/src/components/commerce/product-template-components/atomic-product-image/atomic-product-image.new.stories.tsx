/* eslint-disable @cspell/spellchecker */
import {Meta, StoryObj as Story} from '@storybook/web-components';
import {wrapInProduct} from '../../../../../storybookUtils/commerce/atomic-commerce-product-wrapper';
import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '../../../../../storybookUtils/commerce/commerce-interface-wrapper';
import {parameters} from '../../../../../storybookUtils/common/common-meta-parameters';
import {renderComponent} from '../../../../../storybookUtils/common/render-component';

const {decorator: productDecorator, engineConfig} = wrapInProduct();
const {decorator: commerceInterfaceDecorator, play} = wrapInCommerceInterface({
  skipFirstSearch: true,
  engineConfig,
});

const meta: Meta = {
  component: 'atomic-product-image',
  title: 'Atomic-Commerce/Product Template Components/ProductImage',
  id: 'atomic-product-image',
  render: renderComponent,
  decorators: [productDecorator, commerceInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-image',
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};

const {play: playWithMultipleImages} = wrapInCommerceInterface({
  engineConfig: {
    ...engineConfig,
    preprocessRequest: (r) => {
      const parsed = JSON.parse(r.body as string);
      parsed.query = 'https://sports.barca.group/pdp/SP00003_00001';
      r.body = JSON.stringify(parsed);
      return r;
    },
  },
});

export const WithMultipleImages: Story = {
  name: 'With multiple images',
  play: async (context) => {
    await playWithMultipleImages(context);
  },
};

export const WithNoImage: Story = {
  name: 'With no image',
  args: {
    'attributes-field': 'ec_invalid_image_field',
  },
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};

export const WitCustomFallbackImage: Story = {
  name: 'With custom fallback',
  args: {
    'attributes-field': 'ec_invalid_image_field',
    'attributes-fallback': 'https://sports.barca.group/logos/barca.svg',
  },
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};
