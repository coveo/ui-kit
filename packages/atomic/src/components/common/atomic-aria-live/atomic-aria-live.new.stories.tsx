import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {MockSearchApi} from '@coveo/platform-mock-api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/common/atomic-aria-live/atomic-aria-live.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers('atomic-aria-live', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-aria-live',
  title: 'Common/Aria Live',
  id: 'atomic-aria-live',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    msw: {handlers: [...searchApiHarness.handlers]},
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

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  render: (args) => html`
    ${template(args)}
    <atomic-query-summary></atomic-query-summary>
  `,
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        // Search is already triggered by play() — the AriaLiveRegionController
        // from atomic-query-summary routes a results-loaded message through
        // the atomic-aria-live component.
      },
      expectedText: /results/i,
      timeout: 10000,
    });
  },
};
