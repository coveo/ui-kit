import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock.js';
import {
  type baseResponse,
  smartSnippetSuggestionsResponse,
} from '@/storybook-utils/api/insight/search-response';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const mockInsightApi = new MockInsightApi();

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-smart-snippet-suggestions',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-smart-snippet-suggestions',
  title: 'Insight/Smart Snippet Suggestions',
  id: 'atomic-insight-smart-snippet-suggestions',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockInsightApi.handlers],
    },
  },
  args,
  argTypes,
  beforeEach: async () => {
    mockInsightApi.searchEndpoint.mock(
      () => smartSnippetSuggestionsResponse as unknown as typeof baseResponse
    );
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-insight-smart-snippet-suggestions',
};
