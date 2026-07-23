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
import '@/src/components/search/atomic-result-section-visual/atomic-result-section-visual.js';
import {SearchResponse} from '@coveo/platform-mock-api/search/search-response';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-section-visual',
  {excludeCategories: ['methods']}
);

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
  component: 'atomic-result-section-visual',
  title: 'Search/Result Sections',
  id: 'atomic-result-section-visual',
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
  name: 'atomic-result-section-visual',
  decorators: getResultSectionDecorators(),
  play,
  args: {
    'default-slot': `<img src="https://picsum.photos/seed/picsum/200" alt="Result Image" class="w-full h-auto rounded-lg">`,
  },
};
