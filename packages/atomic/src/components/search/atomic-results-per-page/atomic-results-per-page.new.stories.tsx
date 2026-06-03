import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-results-per-page',
  title: 'Atomic/ResultsPerPage',
  id: 'atomic-results-per-page',

  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-results-per-page',
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const button = await context.canvas.findByShadowRole('button', {
          name: /\d+/,
        });
        button.click();
      },
      expectedText: /results/i,
      timeout: 10000,
    });
  },
};
