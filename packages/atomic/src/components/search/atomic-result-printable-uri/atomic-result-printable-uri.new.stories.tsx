import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

searchApiHarness.searchEndpoint.mock((response) => {
  if ('results' in response) {
    return {
      ...response,
      results: [
        {
          ...response.results[0],
          printableUri: 'https://www.example.com/path/to/document.html',
        },
      ],
      totalCount: 1,
      totalCountFiltered: 1,
    };
  }
  return response;
});

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  includeCodeRoot: false,
});
const {decorator: resultListDecorator} = wrapInResultList('list', false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-printable-uri',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-printable-uri',
  title: 'Search/Result Printable URI',
  id: 'atomic-result-printable-uri',

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
    'max-number-of-parts': 5,
  },
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};

export const WithEllipsis: Story = {
  name: 'With Ellipsis Button',
  parameters: {
    msw: {
      handlers: [
        ...(() => {
          const ellipsisSearchApi = new MockSearchApi();
          ellipsisSearchApi.searchEndpoint.mock((response) => {
            if ('results' in response) {
              return {
                ...response,
                // biome-ignore lint/suspicious/noExplicitAny: Mock response type needs flexibility
                results: response.results.slice(0, 1).map((r: any) => ({
                  ...r,
                  printableUri:
                    'https://www.example.com/level1/level2/level3/level4/level5/level6/document.html',
                  raw: {
                    ...r.raw,
                    parents: `<parents>
                  <parent name="Home" uri="https://www.example.com/" />
                  <parent name="Products" uri="https://www.example.com/products/" />
                  <parent name="Electronics" uri="https://www.example.com/products/electronics/" />
                  <parent name="Computers" uri="https://www.example.com/products/electronics/computers/" />
                  <parent name="Laptops" uri="https://www.example.com/products/electronics/computers/laptops/" />
                  <parent name="Gaming" uri="https://www.example.com/products/electronics/computers/laptops/gaming/" />
                  <parent name="High-End" uri="https://www.example.com/products/electronics/computers/laptops/gaming/high-end/" />
                </parents>`,
                  },
                })),
                totalCount: 1,
                totalCountFiltered: 1,
              };
            }
            return response;
          });
          return ellipsisSearchApi.handlers;
        })(),
      ],
    },
  },
  args: {
    'max-number-of-parts': 5,
  },
};
