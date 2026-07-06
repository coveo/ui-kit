import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-no-results/atomic-no-results.js';

const searchApiHarness = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {play: playInitOnly} = wrapInSearchInterface({skipFirstSearch: true});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-no-results',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-no-results',
  title: 'Search/No Results',
  id: 'atomic-no-results',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-no-results',
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
      totalCountFiltered: 0,
    }));
  },
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
      totalCountFiltered: 0,
    }));
  },
  play: async (context) => {
    await playInitOnly(context);
    await testStatusMessageA11y(context, {
      triggerAction: async (canvasElement) => {
        const searchInterface = canvasElement.querySelector(
          'atomic-search-interface'
        )!;
        await (searchInterface as any).executeFirstSearch();
      },
      expectedText: 'No results',
      timeout: 5000,
    });
  },
};
