import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInResultList} from '@/storybook-utils/search/result-list-wrapper';
import {wrapInResultTemplate} from '@/storybook-utils/search/result-template-wrapper';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-result-localized-text',
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
          r.raw.author = 'Isaac Asimov';
          r.raw.bookcount = 1;
          r.raw.multiplebookscount = 5;
        });
        return res;
      },
    },
  },
  i18n: (i18n) => {
    i18n.addResourceBundle('en', 'translation', {
      book_by_author: 'Book by {{name}}',
      book_count: 'You have {{count}} book',
      book_count_other: 'You have {{count}} books',
    });
  },
});

const {decorator: resultListDecorator} = wrapInResultList(undefined, false);
const {decorator: resultTemplateDecorator} = wrapInResultTemplate();

const meta: Meta = {
  component: 'atomic-result-localized-text',
  title: 'Search/Result Localized Text',
  id: 'atomic-result-localized-text',
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
  name: 'atomic-result-localized-text',
  args: {
    'locale-key': 'book_by_author',
    'field-author': 'name',
  },
};

export const WithPluralForm: Story = {
  name: 'with plural form',
  args: {
    'locale-key': 'book_count',
    'field-count': 'multiplebookscount',
  },
};

export const WithSingularForm: Story = {
  name: 'with singular form',
  args: {
    'locale-key': 'book_count',
    'field-count': 'bookcount',
  },
};
