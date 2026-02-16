import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 1).map((r) => ({
    ...r,
    raw: {
      ...r.raw,
      date: 1609459200000, // January 1, 2021 00:00:00 UTC
    },
  })),
  totalCount: 1,
  totalCountFiltered: 1,
}));

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  includeCodeRoot: false,
});
const {decorator: resultListDecorator} = wrapInResultList('list', false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-date',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-date',
  title: 'Search/Result Date',
  id: 'atomic-result-date',
  render: (args) => template(args),
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};

export const CustomFormat: Story = {
  name: 'With Custom Format',
  args: {
    format: 'MMMM D, YYYY [at] h:mm A',
  },
};

export const RelativeTime: Story = {
  name: 'With Relative Time',
  args: {
    'relative-time': true,
  },
  beforeEach: async () => {
    const yesterday = Date.now() - 24 * 60 * 60 * 1000; // 1 day ago
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(0, 1).map((r) => ({
        ...r,
        raw: {
          ...r.raw,
          date: yesterday,
        },
      })),
      totalCount: 1,
      totalCountFiltered: 1,
    }));
  },
};
