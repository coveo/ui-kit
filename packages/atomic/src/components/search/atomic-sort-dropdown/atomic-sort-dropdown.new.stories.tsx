import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';
import '@/src/components/search/atomic-sort-dropdown/atomic-sort-dropdown.js';
import '@/src/components/search/atomic-sort-expression/atomic-sort-expression.js';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-sort-dropdown',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-sort-dropdown',
  title: 'Search/Sort Dropdown',
  id: 'atomic-sort-dropdown',
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
  name: 'atomic-sort-dropdown',
  args: {
    'default-slot': `
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
  tags: ['a11y', 'test'],
  decorators: [
    (story) => html`<atomic-query-summary></atomic-query-summary>${story()}`,
  ],
  args: {
    ...Default.args,
  },
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const {canvas} = context;
        const select = await canvas.findByShadowRole('combobox', {
          name: /sort by/i,
        });
        (select as HTMLSelectElement).value = 'date descending';
        select.dispatchEvent(new Event('change', {bubbles: true}));
      },
      expectedText: /TODO:/i,
      timeout: 5000,
    });
  },
};
