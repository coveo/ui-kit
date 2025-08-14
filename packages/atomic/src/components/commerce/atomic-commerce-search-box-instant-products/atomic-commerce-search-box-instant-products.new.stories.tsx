import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {userEvent} from 'storybook/test';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceSearchBox} from '@/storybook-utils/commerce/commerce-search-box-wrapper';
import {parameters} from '@/storybook-utils/common/search-box-suggestions-parameters';

const {decorator: commerceInterfaceDecorator, play: commerceInterfacePlay} =
  wrapInCommerceInterface();
const {decorator: commerceSearchBoxDecorator} = wrapInCommerceSearchBox(html`
  <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
`);
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-search-box-instant-products',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-search-box-instant-products',
  title: 'Commerce/Search Box Instant Products',
  id: 'atomic-commerce-search-box-instant-products',
  render: (args) => template(args),
  decorators: [commerceSearchBoxDecorator, commerceInterfaceDecorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  afterEach: async (context) => {
    await commerceInterfacePlay(context);
    const canvas = within(context.canvasElement);
    const searchBox = await canvas.findAllByShadowPlaceholderText('Search');
    await userEvent.click(searchBox[0]);
  },
};

export default meta;

export const Default: Story = {};

export const WithComfortableDensity: Story = {
  name: 'With comfortable density',
  args: {
    density: 'comfortable',
  },
};

export const WithNoImage: Story = {
  name: 'With no image',
  args: {
    'image-size': 'none',
  },
};
