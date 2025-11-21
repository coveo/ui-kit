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
  results: [
    {
      title: 'Animals',
      excerpt: 'Collection of animals',
      clickUri: 'https://example.com/animals',
      uniqueId: 'animals-parent',
      childResults: [
        {
          title: 'Cats',
          excerpt: 'Cat species',
          clickUri: 'https://example.com/cats',
          uniqueId: 'cats-child',
          raw: {
            foldingcollection: 'Animals',
            foldingchild: ['cats'],
            foldingparent: 'animals',
          },
        },
        {
          title: 'Dogs',
          excerpt: 'Dog species',
          clickUri: 'https://example.com/dogs',
          uniqueId: 'dogs-child',
          raw: {
            foldingcollection: 'Animals',
            foldingchild: ['dogs'],
            foldingparent: 'animals',
          },
        },
      ],
      totalNumberOfChildResults: 2,
      raw: {
        foldingcollection: 'Animals',
        foldingchild: ['animals'],
      },
    },
  ],
  totalCount: 1,
  totalCountFiltered: 1,
}));

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  includeCodeRoot: false,
});
const {decorator: resultListDecorator} = wrapInResultList('list', false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-children',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-result-children',
  title: 'Search/Result Children',
  id: 'atomic-result-children',
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
  play,
};

export default meta;

export const Default: Story = {};
