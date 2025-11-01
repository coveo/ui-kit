import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {userEvent} from 'storybook/test';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceSearchBox} from '@/storybook-utils/commerce/commerce-search-box-wrapper';
import {parameters} from '@/storybook-utils/common/search-box-suggestions-parameters';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-search-box-query-suggestions',
  {excludeCategories: ['methods']}
);

const {decorator: commerceInterfaceDecorator, play: commerceInterfacePlay} =
  wrapInCommerceInterface({includeCodeRoot: false});
const {decorator: commerceSearchBoxDecorator} = wrapInCommerceSearchBox();
const meta: Meta = {
  component: 'atomic-commerce-search-box-query-suggestions',
  title: 'Commerce/Search Box Query Suggestions',
  id: 'atomic-commerce-search-box-query-suggestions',
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

  play: async (context) => {
    await commerceInterfacePlay(context);
    const searchBox =
      await context.canvas.findAllByShadowPlaceholderText('Search');
    await userEvent.click(searchBox[0]);
  },
};

export default meta;

export const Default: Story = {};
