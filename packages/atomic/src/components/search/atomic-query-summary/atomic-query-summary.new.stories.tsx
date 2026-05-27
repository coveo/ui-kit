import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-query-summary',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-query-summary',
  title: 'Search/Query Summary',
  id: 'atomic-query-summary',

  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
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
  name: 'Default',
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test'],
  play: async (context) => {
    // The initial search already triggers a status message in atomic-aria-live.
    // We just need to verify the live region gets populated after the search completes.
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        // The search already executed during play(). The aria-live region
        // should already be populated with "Results 1-10 of X" or similar.
        // We trigger nothing extra — just verify the live region has content.
      },
      expectedText: /TODO:/i,
      timeout: 5000,
    });
  },
};
