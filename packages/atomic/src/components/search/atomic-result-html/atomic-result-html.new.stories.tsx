import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-result-html/atomic-result-html.js';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-html',
  {excludeCategories: ['methods']}
);

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  totalCount: 1,
  totalCountFiltered: 1,
  results: response.results.slice(0, 1).map((r: Record<string, unknown>) => ({
    ...r,
    excerpt: '<div>Some <b>HTML</b> content</div>',
    title: '<h2>HTML Title <em>with emphasis</em></h2>',
    raw: {
      ...(r.raw as object),
      custom_html_field: '<p>Custom <strong>HTML</strong> field</p>',
    },
  })),
}));

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface();

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
    chromatic: {disableSnapshot: true},
    msw: {handlers: [...searchApiHarness.handlers]},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-result-html',
  args: {field: 'excerpt'},
};
