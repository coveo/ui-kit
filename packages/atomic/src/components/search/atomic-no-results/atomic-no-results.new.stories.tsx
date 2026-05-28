import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {AtomicSearchInterface} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import '@/src/components/search/atomic-no-results/atomic-no-results.js';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();

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
    msw: {handlers: [...mockSearchApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-no-results',
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
      totalCountFiltered: 0,
    }));
  },
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test'],
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce((response) => response);
    mockSearchApi.searchEndpoint.mockOnce((response) => ({
      ...response,
      results: [],
      totalCount: 0,
      totalCountFiltered: 0,
    }));
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const searchInterface = context.canvasElement.querySelector(
          'atomic-search-interface'
        ) as AtomicSearchInterface;
        await searchInterface.executeFirstSearch();
      },
      expectedText: 'No results',
      timeout: 5000,
    });
  },
};
