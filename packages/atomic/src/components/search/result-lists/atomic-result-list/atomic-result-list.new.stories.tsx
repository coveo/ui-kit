import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, afterEach} = wrapInSearchInterface({
  config: {
    search: {
      preprocessSearchResponseMiddleware: (r) => {
        const [result] = r.body.results;
        result.title = 'Manage the Coveo In-Product Experiences (IPX)';
        result.clickUri = 'https://docs.coveo.com/en/3160';
        return r;
      },
    },
  },
});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-list',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-list',
  title: 'Search/ResultList',
  id: 'atomic-result-list',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  afterEach,
};

export default meta;

export const Default: Story = {
  name: 'List Display',
};

export const Grid: Story = {
  name: 'Grid Display',
  args: {
    display: 'grid',
  },
};
