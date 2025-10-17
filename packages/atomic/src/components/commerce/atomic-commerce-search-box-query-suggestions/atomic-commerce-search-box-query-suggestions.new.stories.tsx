import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {within} from 'shadow-dom-testing-library';
import {userEvent} from 'storybook/test';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceSearchBox} from '@/storybook-utils/commerce/commerce-search-box-wrapper';
import {parameters} from '@/storybook-utils/common/search-box-suggestions-parameters';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-search-box-query-suggestions',
  {excludeCategories: ['methods']}
);

const {
  decorator: commerceInterfaceDecorator,
  afterEach: commerceInterfacePlay,
} = wrapInCommerceInterface({includeCodeRoot: false});
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
  //TODO KIT-5111: Remove beforeEach when refactored in preview.ts
  beforeEach({canvasElement, canvas}) {
    Object.assign(canvas, {...within(canvasElement)});
  },
  play: async ({mount, step, ...restOfContext}) => {
    const canvas = (await mount()) as ReturnType<typeof within>;
    await commerceInterfacePlay({mount, step, ...restOfContext});
    await step('Click in the search box', async () => {
      const searchBox = await canvas.findByShadowRole('textbox');
      await userEvent.click(searchBox);
    });
  },
};

export default meta;

export const Default: Story = {};
