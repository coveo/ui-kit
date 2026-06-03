import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {userEvent} from 'storybook/test';
import {testStatusMessageA11y} from '@/storybook-utils/a11y/status-message.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {searchFacetTransformer} from '@/storybook-utils/api/search/facet-transformer';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';
import '@/src/components/search/atomic-sort-dropdown/atomic-sort-dropdown.js';
import '@/src/components/search/atomic-sort-expression/atomic-sort-expression.js';
import '@/src/components/search/atomic-query-summary/atomic-query-summary.js';

const searchApiHarness = new MockSearchApi();
searchApiHarness.searchEndpoint.addRequestTransformer(searchFacetTransformer);

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
  tags: ['a11y', 'test', '!dev'],
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
    `,
  },
  decorators: [
    (story) => html`
      <atomic-query-summary></atomic-query-summary>
      ${story()}
    `,
  ],
  play: async (context) => {
    await play(context);
    await testStatusMessageA11y(context, {
      triggerAction: async () => {
        const select = await context.canvas.findByShadowRole('combobox');
        await userEvent.selectOptions(select, 'date descending');
      },
      expectedText: /Results \d+-\d+ of \d+/i,
      timeout: 1000,
    });
  },
};
