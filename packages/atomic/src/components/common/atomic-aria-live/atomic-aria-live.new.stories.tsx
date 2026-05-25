import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/common/atomic-aria-live/atomic-aria-live.js';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-aria-live',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-aria-live',
  title: 'Common/Aria Live',
  id: 'atomic-aria-live',
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

export const Default: Story = {};
