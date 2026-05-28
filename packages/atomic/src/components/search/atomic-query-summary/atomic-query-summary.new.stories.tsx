import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {buildSearchResponseWithResults} from '@/storybook-utils/api/search/search-response-mocks';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import type {AtomicSearchInterface} from '@/src/components/search/atomic-search-interface/atomic-search-interface';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

const mockSearchApi = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-query-summary',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-query-summary',
  title: 'Search/Query Summary',
  id: 'atomic-query-summary',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
    msw: {handlers: [...mockSearchApi.handlers]},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockSearchApi.clearAll();
  },

  play,
};

export default meta;

export const Default: Story = {
  name: 'Default',
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test'],
  beforeEach: async () => {
    mockSearchApi.searchEndpoint.mockOnce(buildSearchResponseWithResults(120));
    mockSearchApi.searchEndpoint.mockOnce(buildSearchResponseWithResults(42));
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async (canvasElement) => {
        await canvasElement
          .querySelector<AtomicSearchInterface>('atomic-search-interface')!
          .executeFirstSearch();
      },
      expectedText: 'Results loaded. Results 1-10 of 42',
      timeout: 5000,
    });
  },
};
