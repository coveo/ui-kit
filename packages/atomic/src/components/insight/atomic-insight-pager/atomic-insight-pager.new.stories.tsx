import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, afterEach} = wrapInInsightInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-insight-pager',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-insight-pager',
  title: 'Insight/Pager',
  id: 'atomic-insight-pager',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args: {
    ...args,
  },
  argTypes,
  afterEach,
};

export default meta;

export const Default: Story = {};

export const WithACustomNumberOfPages: Story = {
  name: 'With a custom number of pages',
  args: {
    'number-of-pages': '10',
  },
};
