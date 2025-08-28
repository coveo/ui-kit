import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, afterEach} = wrapInInsightInterface({
  organizationId: 'invalid-organization-id',
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-query-error',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-query-error',
  title: 'Insight/Query Error',
  id: 'atomic-insight-query-error',
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

export const Default: Story = {};
