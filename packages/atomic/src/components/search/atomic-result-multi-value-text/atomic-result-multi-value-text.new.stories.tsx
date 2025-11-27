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
  results: response.results.slice(0, 1).map((result) => ({
    ...result,
    raw: {
      ...result.raw,
      language: ['English', 'French', 'Spanish', 'German', 'Portuguese'],
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
  'atomic-result-multi-value-text',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-multi-value-text',
  title: 'Search/Result Multi-Value Text',
  id: 'atomic-result-multi-value-text',

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
  args: {
    ...args,
    field: 'language',
  },
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};

export const WithMaxValues: Story = {
  name: 'With max-values-to-display',
  args: {
    field: 'language',
    'max-values-to-display': 2,
  },
};
