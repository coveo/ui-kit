import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import '@/src/components/search/atomic-result-text/atomic-result-text.js';

const searchApiHarness = new MockSearchApi();

searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: response.results.slice(0, 1).map((r) => ({
    ...r,
    excerpt: 'Bonobo the great ape',
    title: 'Bonobo the great ape',
    firstSentences: 'Bonobo the great ape',
    printableUri: 'https://example.com/bonobo',
    raw: {
      ...r.raw,
      author: 'Bonobo',
      summary: 'Bonobo the great ape',
    },
    excerptHighlights: [{offset: 0, length: 6}],
    titleHighlights: [{offset: 0, length: 6}],
    firstSentencesHighlights: [{offset: 0, length: 6}],
    printableUriHighlights: [{offset: 20, length: 6}],
    summaryHighlights: [{offset: 0, length: 6}],
  })),
  totalCount: 1,
  totalCountFiltered: 1,
}));

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-text',
  {excludeCategories: ['methods']}
);

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  includeCodeRoot: false,
});

const {decorator: resultListDecorator} = wrapInResultList(undefined, false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const meta: Meta = {
  component: 'atomic-result-text',
  title: 'Search/Result Text',
  id: 'atomic-result-text',
  render: (args) => template(args),
  decorators: [
    resultTemplateDecorator,
    resultListDecorator,
    searchInterfaceDecorator,
  ],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  beforeEach: async () => {
    searchApiHarness.clearAll();
  },

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-text',
  args: {field: 'excerpt'},
};

export const WithTitle: Story = {
  name: 'with title field',
  args: {field: 'title'},
};

export const WithFirstSentences: Story = {
  name: 'with firstSentences field',
  args: {field: 'firstSentences'},
};

export const WithPrintableUri: Story = {
  name: 'with printableuUri field',
  args: {field: 'printableUri'},
};

export const WithSummary: Story = {
  name: 'with summary field',
  args: {field: 'summary'},
};

export const WithoutHighlights: Story = {
  name: 'without highlights',
  args: {field: 'excerpt', 'no-highlight': true},
};
