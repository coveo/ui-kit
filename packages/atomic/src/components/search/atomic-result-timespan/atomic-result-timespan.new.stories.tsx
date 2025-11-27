import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

searchApiHarness.searchEndpoint.mock((response) => {
  if ('error' in response) {
    return response;
  }
  return {
    ...response,
    results: response.results
      .map((result) => ({
        ...result,
        raw: {
          ...result.raw,
          ytvideoduration: 3665,
        },
      }))
      .slice(0, 1),
    totalCount: 1,
    totalCountFiltered: 1,
  };
});

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  includeCodeRoot: false,
});
const {decorator: resultListDecorator} = wrapInResultList('list', false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-timespan',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-timespan',
  title: 'Search/Result Timespan',
  id: 'atomic-result-timespan',

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
    field: 'ytvideoduration',
    unit: 's',
  },
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};
