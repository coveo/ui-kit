import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-no-results/atomic-no-results.js';

const searchApiHarness = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-no-results',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-no-results',
  title: 'Search/No Results',
  id: 'atomic-no-results',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-no-results',
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
      totalCountFiltered: 0,
    }));
  },
};
