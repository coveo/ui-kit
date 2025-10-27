import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

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
  decorators: [decorator],
  parameters: {
    ...parameters,
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
  decorators: [
    (story) => html`
      <atomic-timeframe-facet field="date"> ${story()} </atomic-timeframe-facet>
    `,
  ],
};
