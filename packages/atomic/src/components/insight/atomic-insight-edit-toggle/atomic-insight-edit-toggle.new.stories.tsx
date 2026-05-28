import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockInsightApi} from '@/storybook-utils/api/insight/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';
import '@/src/components/insight/atomic-insight-edit-toggle/atomic-insight-edit-toggle.js';

const insightApiHarness = new MockInsightApi();

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-edit-toggle',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-edit-toggle',
  title: 'Insight/Edit Toggle',
  id: 'atomic-insight-edit-toggle',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    chromatic: {disableSnapshot: true},
    actions: {
      handles: events,
    },
    msw: {
      handlers: [...insightApiHarness.handlers],
    },
  },
  beforeEach: () => {
    insightApiHarness.searchEndpoint.clear();
    insightApiHarness.querySuggestEndpoint.clear();
  },
  args,
  argTypes,
  play,
};

export default meta;

export const Default: Story = {};

export const WithTooltip: Story = {
  name: 'With tooltip',
  args: {
    tooltip: 'Click to edit this item',
  },
};
