import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, afterEach} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-layout',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-layout',
  title: 'Insight/Layout',
  id: 'atomic-insight-layout',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes,
  afterEach,
  args: {
    ...args,
    'default-slot': `<span>Layout content</span>`,
  },
};

export default meta;

export const Default: Story = {};
