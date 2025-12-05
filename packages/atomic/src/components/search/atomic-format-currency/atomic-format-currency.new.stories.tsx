import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import type {baseSearchResponse} from '@/storybook-utils/api/search/mock';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-format-currency',
  {excludeCategories: ['methods']}
);

const searchApiHarness = new MockSearchApi();

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  includeCodeRoot: false,
});
const {decorator: resultListDecorator} = wrapInResultList('list', false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate(false);

const meta: Meta = {
  component: 'atomic-format-currency',
  title: 'Search/Format Currency',
  id: 'atomic-format-currency',

  render: (args) => template(args),
  decorators: [searchInterfaceDecorator],
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

  play,
};

export default meta;

export const Facet: Story = {
  name: 'Within Numeric Facet',
  render: (args) => html`
    <atomic-numeric-facet field="sncost" label="Cost">
      ${template(args)}
    </atomic-numeric-facet>
  `,
  args: {
    currency: 'USD',
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: (response as typeof baseSearchResponse).results.slice(0, 1),
      facets: [
        {
          facetId: 'sncost',
          field: 'sncost',
          indexScore: 0,
          moreValuesAvailable: false,
          values: [
            {
              start: 0,
              end: 100,
              endInclusive: false,
              numberOfResults: 45,
              state: 'idle',
            },
            {
              start: 100,
              end: 500,
              endInclusive: false,
              numberOfResults: 32,
              state: 'idle',
            },
            {
              start: 500,
              end: 1000,
              endInclusive: true,
              numberOfResults: 18,
              state: 'idle',
            },
          ],
          domain: {
            start: 0,
            end: 1000,
          },
        },
      ],
    }));
  },
};

export const Result: Story = {
  name: 'Within Numeric Result',
  render: (args) => html`
    <atomic-result-number field="sncost">
      ${template(args)}
    </atomic-result-number>
  `,
  decorators: [resultTemplateDecorator, resultListDecorator],
  args: {
    currency: 'USD',
  },
  beforeEach: () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: (response as typeof baseSearchResponse).results
        .slice(0, 1)
        // biome-ignore lint/suspicious/noExplicitAny: raw fields are dynamically added
        .map((result: any) => ({
          ...result,
          raw: {
            ...result.raw,
            sncost: 299.99,
          },
        })),
    }));
  },
};
