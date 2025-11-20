import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {expect, userEvent} from 'storybook/test';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceSearchBox} from '@/storybook-utils/commerce/commerce-search-box-wrapper';
import {parameters} from '@/storybook-utils/common/search-box-suggestions-parameters';

const mockCommerceApi = new MockCommerceApi();

const {decorator: commerceInterfaceDecorator, play: commerceInterfacePlay} =
  wrapInCommerceInterface({includeCodeRoot: false});
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
    msw: {handlers: [...mockCommerceApi.handlers]},
  },
  args,
  argTypes,

  play: async (context) => {
    const {canvas, step} = context;
    await commerceInterfacePlay(context);
    const searchBox = await canvas.findAllByShadowPlaceholderText('Search');
    await step('Click on the search box to show instant products', async () => {
      await userEvent.click(searchBox[0]);
      await expect(
        await canvas.findByShadowLabelText(
          /Zippy Yellow Surfboard, instant product\.( Button\.)? 1 of \d+\. In Right list\./
        )
      ).toBeVisible();
    });
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
