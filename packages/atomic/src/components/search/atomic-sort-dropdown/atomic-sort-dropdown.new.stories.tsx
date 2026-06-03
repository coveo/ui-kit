import {userEvent} from '@storybook/test';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();

const meta: Meta = {
  component: 'atomic-sort-dropdown',
  title: 'Atomic/SortDropdown',
  id: 'atomic-sort-dropdown',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-sort-dropdown',
  args: {
    'slots-default': `
      <atomic-sort-expression
        label="relevance"
        expression="relevancy"
      ></atomic-sort-expression>
      <atomic-sort-expression
        label="most-recent"
        expression="date descending"
      ></atomic-sort-expression>
      <atomic-sort-expression
        label="Price ascending"
        expression="sncost ascending"
      ></atomic-sort-expression>
      <atomic-sort-expression
        label="Price ascending & Most recent"
        expression="sncost ascending, date descending"
      ></atomic-sort-expression>
    `,
  },
};

export const A11yStatusMessage: Story = {
  name: 'A11y Status Message',
  tags: ['a11y', 'test', '!dev'],
  args: {
    'slots-default': `
      <atomic-sort-expression
        label="relevance"
        expression="relevancy"
      ></atomic-sort-expression>
      <atomic-sort-expression
        label="most-recent"
        expression="date descending"
      ></atomic-sort-expression>
    `,
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const select = await context.canvas.findByShadowRole('combobox');
        await userEvent.selectOptions(select, 'most-recent');
      },
      expectedText: /results/i,
      timeout: 10000,
    });
  },
};
