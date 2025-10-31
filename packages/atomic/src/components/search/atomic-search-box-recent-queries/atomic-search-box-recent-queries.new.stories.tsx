import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {userEvent} from 'storybook/test';
import {parameters} from '@/storybook-utils/common/search-box-suggestions-parameters';
import {wrapInSearchBox} from '@/storybook-utils/search/search-box-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator: searchInterfaceDecorator, play: searchInterfacePlay} =
  wrapInSearchInterface({}, false, false);
const {decorator: searchBoxDecorator} = wrapInSearchBox();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-box-recent-queries',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-search-box-recent-queries',
  title: 'Search/Search Box Recent Queries',
  id: 'atomic-search-box-recent-queries',
  render: (args) => template(args),
  decorators: [searchBoxDecorator, searchInterfaceDecorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play: async (context) => {
    await searchInterfacePlay(context);
    const searchBox =
      await context.canvas.findAllByShadowPlaceholderText('Search');
    await userEvent.click(searchBox[0]);
  },
};

export default meta;

export const Default: Story = {};
