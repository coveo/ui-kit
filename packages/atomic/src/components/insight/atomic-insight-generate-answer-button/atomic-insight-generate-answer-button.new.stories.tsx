import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-generate-answer-button',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-generate-answer-button',
  title: 'Insight/Generate Answer Button',
  id: 'atomic-insight-generate-answer-button',
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
  play,
  tags: ['!dev'],
};

export default meta;

export const Default: Story = {};

export const Tooltip: Story = {
  name: 'With tooltip',
  args: {
    tooltip: 'Generate Answer',
  },
};
