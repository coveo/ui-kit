import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, afterEach} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-no-results',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-no-results',
  title: 'Insight/atomic-insight-no-results',
  id: 'atomic-insight-no-results',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  afterEach,
};

export default meta;

export const Default: Story = {
  name: 'Using the No Results component',
};

export const NoResults: Story = {
  name: 'No Results State',
  args: {
    searchStatusState: {
      firstSearchExecuted: true,
      isLoading: false,
      hasResults: false,
    },
    querySummaryState: {
      query: 'test query',
      hasQuery: true,
      hasResults: false,
    },
  },
};

export const HasResults: Story = {
  name: 'Has Results State',
  args: {
    searchStatusState: {
      firstSearchExecuted: true,
      isLoading: false,
      hasResults: true,
    },
    querySummaryState: {
      query: 'test query',
      hasQuery: true,
      hasResults: true,
    },
  },
};
