import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/common/atomic-layout-section/atomic-layout-section.js';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-layout-section',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-layout-section',
  title: 'Common/Layout Section',
  id: 'atomic-layout-section',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {handlers: [...searchApiHarness.handlers]},
    chromatic: {disableSnapshot: true},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,

  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-layout-section',
  args: {
    'default-slot': `<span>Section content</span>`,
  },
};
