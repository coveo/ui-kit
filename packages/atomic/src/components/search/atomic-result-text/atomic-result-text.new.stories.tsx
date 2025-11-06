import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-text',
  {excludeCategories: ['methods']}
);

const {decorator: searchInterfaceDecorator, play} = wrapInSearchInterface({
  config: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.numberOfResults = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
    search: {
      preprocessSearchResponseMiddleware: (res) => {
        res.body.results.forEach((r) => {
          r.excerpt = 'Bonobo the great ape';
          r.title = 'Bonobo the great ape';
          r.firstSentences = 'Bonobo the great ape';
          r.printableUri = 'https://example.com/bonobo';
          r.raw.author = 'Bonobo';
          r.raw.summary = 'Bonobo the great ape';
          r.excerptHighlights = [{offset: 0, length: 6}];
          r.titleHighlights = [{offset: 0, length: 6}];
          r.firstSentencesHighlights = [{offset: 0, length: 6}];
          r.printableUriHighlights = [{offset: 20, length: 6}];
          r.summaryHighlights = [{offset: 0, length: 6}];
        });
        return res;
      },
    },
  },
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
