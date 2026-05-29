import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {within} from 'shadow-dom-testing-library';
import {userEvent} from 'storybook/test';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {buildSearchResponseWithResults} from '@/storybook-utils/api/search/search-response-mocks';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';
import '@/src/components/search/atomic-search-box/atomic-search-box.js';
import '@/src/components/search/atomic-search-box-instant-results/atomic-search-box-instant-results.js';
import '@/src/components/search/atomic-search-box-query-suggestions/atomic-search-box-query-suggestions.js';
import '@/src/components/search/atomic-search-box-recent-queries/atomic-search-box-recent-queries.js';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-search-box',
  {excludeCategories: ['methods']}
);
const {decorator, play} = wrapInSearchInterface({
  skipFirstSearch: true,
  includeCodeRoot: false,
});

const searchApiHarness = new MockSearchApi();
const localStorageRecentQueriesKey = 'coveo-recent-queries';

const normalWidthDecorator: Decorator = (story) => html`
  <div style="min-width: 600px;" id="code-root">${story()}</div>
`;

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
    msw: {
      handlers: [...searchApiHarness.handlers],
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

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  decorators: [
    (story) => html`${story()}<atomic-query-summary></atomic-query-summary>`,
  ],
  beforeEach: async () => {
    searchApiHarness.clearAll();
    searchApiHarness.searchEndpoint.mockOnce(
      buildSearchResponseWithResults(42)
    );
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const searchBox = await canvas.findByShadowPlaceholderText('Search');
        await userEvent.type(searchBox, 'accessibility{enter}');
      },
      expectedText: 'Results loaded. Results 1-10 of 42',
      timeout: 5000,
    });
  },
};

export const A11yInstantResultsStatusMessage: Story = {
  name: 'A11y Instant Results Status Message',
  tags: ['a11y', 'test', '!dev'],
  args: {
    ...RichSearchBox.args,
  },
  beforeEach: async () => {
    searchApiHarness.clearAll();
    searchApiHarness.searchEndpoint.mockOnce(
      buildSearchResponseWithResults(4, 4)
    );
    localStorage.removeItem(localStorageRecentQueriesKey);
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const searchBox = await canvas.findByShadowPlaceholderText('Search');
        await userEvent.click(searchBox);
        await userEvent.type(searchBox, 'coveo');
      },
      expectedText: /9 search suggestions are available for .*coveo\./,
      timeout: 5000,
    });
  },
};

export const A11yRecentQueriesClearedStatusMessage: Story = {
  name: 'A11y Recent Queries Cleared Status Message',
  tags: ['a11y', 'test', '!dev'],
  beforeEach: () => {
    localStorage.setItem(
      localStorageRecentQueriesKey,
      JSON.stringify(['accessibility'])
    );
    return () => localStorage.removeItem(localStorageRecentQueriesKey);
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const canvas = within(context.canvasElement);
        const searchBox = await canvas.findByShadowPlaceholderText('Search');
        await userEvent.click(searchBox);
        const clearRecentSearchesButton = await canvas.findByShadowLabelText(
          /Clear recent searches/,
          {exact: false}
        );
        await userEvent.click(clearRecentSearchesButton);
      },
      expectedText: 'Recent searches cleared',
      timeout: 5000,
    });
  },
};
