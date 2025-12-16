import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();
const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-timeframe',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-timeframe',
  title: 'Common/Timeframe',
  id: 'atomic-timeframe',

  render: (args) => template(args),
  decorators: [
    (story) => html`
      <atomic-timeframe-facet field="date"> ${story()} </atomic-timeframe-facet>
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
  name: 'atomic-timeframe',
  args: {unit: 'year'},
};

export const WithPastPeriod: Story = {
  name: 'Past Timeframe',
  args: {
    period: 'past',
    unit: 'month',
    amount: 3,
    label: 'Last 3 Months',
  },
};

export const WithNextPeriod: Story = {
  name: 'Next Timeframe',
  args: {
    period: 'next',
    unit: 'week',
    amount: 2,
    label: 'Next 2 Weeks',
  },
};

export const MultipleTimeframes: Story = {
  name: 'Multiple Timeframes',
  render: () => html`
    <atomic-timeframe-facet field="date">
      <atomic-timeframe unit="day" amount="7" label="Last Week"></atomic-timeframe>
      <atomic-timeframe unit="month" amount="1" label="Last Month"></atomic-timeframe>
      <atomic-timeframe unit="month" amount="3" label="Last Quarter"></atomic-timeframe>
      <atomic-timeframe unit="year" amount="1" label="Last Year"></atomic-timeframe>
    </atomic-timeframe-facet>
  `,
};
