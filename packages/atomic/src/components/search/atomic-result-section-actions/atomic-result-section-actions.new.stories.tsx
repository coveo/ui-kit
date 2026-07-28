import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {
  getResultSectionArgs,
  getResultSectionArgTypes,
  getResultSectionDecorators,
} from '@/storybook-utils/search/result-section-story-utils';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-result-section-actions/atomic-result-section-actions.js';
import {SearchResponse} from '@coveo/platform-mock-api/search/search-response';

const {events, args, argTypes, template} = getStorybookHelpers('atomic-result-section-actions', {
  excludeCategories: ['methods'],
});

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.mock((response) => ({
  ...(response as SearchResponse),
  results: (response as SearchResponse).results.slice(0, 1),
  numberOfResults: 1,
}));

const {play} = wrapInSearchInterface({
  includeCodeRoot: false,
});

const meta: Meta = {
  component: 'atomic-result-section-actions',
  title: 'Search/Result Sections',
  id: 'atomic-result-section-actions',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    msw: {handlers: [...searchApiHarness.handlers]},
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    ...getResultSectionArgs(),
  },
  argTypes: {
    ...argTypes,
    ...getResultSectionArgTypes(),
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-section-actions',
  decorators: getResultSectionDecorators(),
  play,
  args: {
    'default-slot': `<button class="p-1 btn btn-primary">Show Details</button>`,
  },
};
