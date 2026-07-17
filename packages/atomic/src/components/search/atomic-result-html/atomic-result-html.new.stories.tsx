import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import '@/src/components/search/atomic-result-html/atomic-result-html.js';
import {SearchResponse} from '@coveo/platform-mock-api/search/search-response';

const searchApiHarness = new MockSearchApi();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-html',
  {excludeCategories: ['methods']}
);

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  includeCodeRoot: false,
});

const {decorator: resultListDecorator} = wrapInResultList(undefined, false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const meta: Meta = {
  component: 'atomic-result-html',
  title: 'Search/ResultList/ResultHtml',
  id: 'atomic-result-html',
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
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.clear();
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: (response as SearchResponse).results
        .slice(0, 1)
        .map((r: any) => ({
          ...r,
          excerpt: '<div>Some <b>HTML</b> content</div>',
          title: '<h2>HTML Title <em>with emphasis</em></h2>',
          raw: {
            ...r.raw,
            custom_html_field: '<p>Custom <strong>HTML</strong> field</p>',
          },
        })),
      totalCount: 1,
      totalCountFiltered: 1,
    }));
  },

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-html',
  args: {field: 'excerpt'},
};
