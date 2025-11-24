import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {HttpResponse, http} from 'msw';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-box',
  {excludeCategories: ['methods']}
);
const {decorator, play} = wrapInSearchInterface({
  skipFirstSearch: true,
  includeCodeRoot: false,
});

const normalWidthDecorator: Decorator = (story) =>
  html` <div style="min-width: 600px;" id="code-root">${story()}</div> `;

const meta: Meta = {
  component: 'atomic-search-box',
  title: 'Search/Search Box',
  id: 'atomic-search-box',
  render: (args) => template(args),
  decorators: [normalWidthDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
    'minimum-query-length': '0',
  },
  argTypes,

  play,
};

export default meta;

export const Default: Story = {};

export const RichSearchBox: Story = {
  name: 'With suggestions, recent queries and instant results',
  args: {
    'default-slot': ` <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
      <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
      <atomic-search-box-instant-results
        image-size="small"
      ></atomic-search-box-instant-results>`,
  },
};

export const StandaloneSearchBox: Story = {
  name: 'As a standalone search box',
  args: {
    'redirection-url':
      './iframe.html?id=atomic-search-interface--with-result-list',
  },
};

export const WithSuggestions: Story = {
  name: 'With custom suggestions',
  args: {
    'default-slot': `<atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>`,
    'minimum-query-length': '0',
  },
  parameters: {
    msw: {
      handlers: [
        http.post('**/rest/search/v2/querySuggest', () => {
          const completions = Array.from({length: 5}, (_, i) => ({
            expression: `query-suggestion-${i}`,
            highlighted: `query-suggestion-${i}`,
          }));

          return HttpResponse.json({completions});
        }),
      ],
    },
  },
};

export const WithSuggestionsAndRecentQueries: Story = {
  name: 'With suggestions and recent queries',
  args: {
    'default-slot': `
      <atomic-search-box-recent-queries></atomic-search-box-recent-queries>
      <atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>
    `,
    'minimum-query-length': '0',
  },
  parameters: {
    msw: {
      handlers: [
        http.post('**/rest/search/v2/querySuggest', () => {
          const completions = Array.from({length: 10}, (_, i) => ({
            expression: `query-suggestion-${i}`,
            highlighted: `query-suggestion-${i}`,
          }));

          return HttpResponse.json({completions});
        }),
      ],
    },
  },
  beforeEach: () => {
    const count = 4;
    const localStorageKey = 'coveo-recent-queries';
    const recentQueries = Array.from(
      {length: count},
      (_, i) => `recent query ${i}`
    );
    const stringified = JSON.stringify(recentQueries);
    localStorage.setItem(localStorageKey, stringified);
    return () => {
      localStorage.removeItem(localStorageKey);
    };
  },
};

export const WithNoSuggestions: Story = {
  name: 'With no suggestions',
  args: {
    'default-slot': `<atomic-search-box-query-suggestions></atomic-search-box-query-suggestions>`,
    'minimum-query-length': '0',
  },
  parameters: {
    msw: {
      handlers: [
        http.post('**/rest/search/v2/querySuggest', () => {
          return HttpResponse.json({completions: []});
        }),
      ],
    },
  },
};
