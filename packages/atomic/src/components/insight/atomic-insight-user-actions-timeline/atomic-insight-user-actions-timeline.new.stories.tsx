import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {MockMachineLearningApi} from '@/storybook-utils/api/machinelearning/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import '@/src/components/insight/atomic-insight-user-actions-timeline/atomic-insight-user-actions-timeline.js';

const insightApiHarness = new MockInsightApi();
const machineLearningApiHarness = new MockMachineLearningApi();

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-user-actions-timeline',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-user-actions-timeline',
  title: 'Insight/User Actions Timeline',
  id: 'atomic-insight-user-actions-timeline',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    // TODO SFINT-6463: Fix a11y issues in the User Actions Timeline component.
    a11y: {disable: true},
    actions: {
      handles: events,
    },
    msw: {
      handlers: [
        ...insightApiHarness.handlers,
        ...machineLearningApiHarness.handlers,
      ],
    },
  },
  beforeEach: () => {
    insightApiHarness.searchEndpoint.clear();
    insightApiHarness.querySuggestEndpoint.clear();
  },
  args: {
    ...args,
    'user-id': 'exampleUserId',
    'ticket-creation-date-time': encodeURIComponent('2024-08-30'),
  },
  argTypes,
  play,
};

export default meta;

export const Default: Story = {
  play,
};
