import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {userEvent} from 'storybook/test';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceSearchBox} from '@/storybook-utils/commerce/commerce-search-box-wrapper';
import {renderComponentWithoutCodeRoot} from '@/storybook-utils/common/render-component';
import {parameters} from '@/storybook-utils/common/search-box-suggestions-parameters';

const {decorator: commerceInterfaceDecorator, play: commerceInterfacePlay} =
  wrapInCommerceInterface();
const {decorator: commerceSearchBoxDecorator} = wrapInCommerceSearchBox(html`
  <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
`);

const meta: Meta = {
  component: 'atomic-commerce-search-box-instant-products',
  title: 'Commerce/Search Box Instant Products',
  id: 'atomic-commerce-search-box-instant-products',
  render: renderComponentWithoutCodeRoot,
  decorators: [commerceSearchBoxDecorator, commerceInterfaceDecorator],
  parameters,
  play: async (context) => {
    await commerceInterfacePlay(context);
    const canvas = within(context.canvasElement);
    const searchBox = await canvas.findAllByShadowPlaceholderText('Search');
    await userEvent.click(searchBox[0]);
  },
  argTypes: {
    'attributes-density': {
      name: 'density',
      options: ['normal', 'comfortable', 'compact'],
    },
    'attributes-image-size': {
      name: 'image-size',
      options: ['icon', 'small', 'large', 'none'],
    },
  },
};

export default meta;

export const Default: Story = {};

export const WithComfortableDensity: Story = {
  name: 'With comfortable density',
  args: {
    'attributes-density': 'comfortable',
  },
};

export const WithNoImage: Story = {
  name: 'With no image',
  args: {
    'attributes-image-size': 'none',
  },
};
