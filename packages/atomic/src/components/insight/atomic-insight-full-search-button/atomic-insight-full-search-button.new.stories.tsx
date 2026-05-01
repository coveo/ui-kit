import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import '@/src/components/insight/atomic-insight-full-search-button/atomic-insight-full-search-button.js';

const mockedInsightApi = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-full-search-button',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-full-search-button',
  title: 'Insight/Full Search Button',
  id: 'atomic-insight-full-search-button',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: false},
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...mockedInsightApi.handlers],
    },
  },
  beforeEach: () => {
    mockedInsightApi.searchEndpoint.clear();
    mockedInsightApi.querySuggestEndpoint.clear();
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};
