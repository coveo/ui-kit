import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-sort-expression',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-sort-expression',
  title: 'Search/SortExpression',
  id: 'atomic-sort-expression',

  render: (args) => template(args),
  decorators: [
    (story) => html`
      <atomic-sort-dropdown> ${story()} </atomic-sort-dropdown>
    `,
    decorator,
  ],
  parameters: {
    ...parameters,
    msw: {
      handlers: [...searchApiHarness.handlers],
    },
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
  name: 'atomic-sort-expression',
  args: {
    label: 'Relevance',
    expression: 'relevancy',
  },
};

export const DateDescending: Story = {
  name: 'Date Descending Sort',
  args: {
    label: 'Newest',
    expression: 'date descending',
  },
};

export const WithTabsIncluded: Story = {
  name: 'With Tabs Included',
  args: {
    label: 'Relevance',
    expression: 'relevancy',
    'tabs-included': '["all", "documents"]',
  },
};

export const WithTabsExcluded: Story = {
  name: 'With Tabs Excluded',
  args: {
    label: 'Relevance',
    expression: 'relevancy',
    'tabs-excluded': '["images"]',
  },
};

export const ComplexExpression: Story = {
  name: 'Complex Sort Expression',
  args: {
    label: 'Size then Date',
    expression: 'size ascending, date descending',
  },
};
