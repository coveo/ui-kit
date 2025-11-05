import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';

import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-load-more-results',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-load-more-results',
  title: 'Search/LoadMoreResults',
  id: 'atomic-load-more-results',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
  },
  args,
  argTypes,
  beforeEach: () => {
    searchApiHarness.searchEndpoint.clear();
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(0, 40),
    }));
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(40, 80),
    }));
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: response.results.slice(80),
    }));
  },
  play,
};

export default meta;

export const Default: Story = {};
