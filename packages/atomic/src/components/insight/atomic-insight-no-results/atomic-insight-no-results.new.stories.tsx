import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-no-results',
  {excludeCategories: ['methods']}
);

const insightApiHarness = new MockInsightApi();

insightApiHarness.searchEndpoint.mock((response) => ({
  ...response,
  results: [],
  totalCount: 0,
  totalCountFiltered: 0,
}));

const {decorator, play} = wrapInInsightInterface();

const meta: Meta = {
  component: 'atomic-insight-no-results',
  title: 'Insight/No Results',
  id: 'atomic-insight-no-results',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...insightApiHarness.handlers],
    },
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};
