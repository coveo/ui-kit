import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit-html';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInInsightInterface} from '@/storybook-utils/insight/insight-interface-wrapper';

const {decorator, play} = wrapInInsightInterface();
const {events, args, argTypes} = getStorybookHelpers('atomic-insight-layout', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-insight-layout',
  title: 'Insight/Layout',
  id: 'atomic-insight-layout',
  render: () => html`<atomic-insight-layout>
   <atomic-layout-section section="search"> search section</atomic-layout-section>
  <atomic-layout-section section="results"> results section</atomic-layout-section>
  </atomic-insight-layout>`,
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes,

  play,
  args,
};

export default meta;

export const Default: Story = {};
