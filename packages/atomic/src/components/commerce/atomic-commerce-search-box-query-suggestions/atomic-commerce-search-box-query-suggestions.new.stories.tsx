import {userEvent} from '@storybook/test';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {within} from 'shadow-dom-testing-library';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceSearchBox} from '@/storybook-utils/commerce/commerce-search-box-wrapper';
import {renderComponentWithoutCodeRoot} from '@/storybook-utils/common/render-component';
import {parameters} from '@/storybook-utils/common/search-box-suggestions-parameters';

const {decorator: commerceInterfaceDecorator, play: commerceInterfacePlay} =
  wrapInCommerceInterface();
const {decorator: commerceSearchBoxDecorator} = wrapInCommerceSearchBox();
const meta: Meta = {
  component: 'atomic-commerce-search-box-query-suggestions',
  title: 'Commerce/Search Box Query Suggestions',
  id: 'atomic-commerce-search-box-query-suggestions',
  render: renderComponentWithoutCodeRoot,
  decorators: [commerceSearchBoxDecorator, commerceInterfaceDecorator],
  parameters,
  play: async (context) => {
    await commerceInterfacePlay(context);
    const canvas = within(context.canvasElement);
    const searchBox = await canvas.findAllByShadowPlaceholderText('Search');
    await userEvent.click(searchBox[0]);
  },
};

export default meta;

export const Default: Story = {};
