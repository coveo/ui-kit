import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-numeric-range',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-numeric-range',
  title: 'Common/Numeric Range',
  id: 'atomic-numeric-range',

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
  name: 'atomic-numeric-range',
  args: {start: 0, end: 1000},
  decorators: [
    (story) => html`  
        <atomic-numeric-facet
          field="ytviewcount"
        >
        ${story()}
        </atomic-facet>
    `,
  ],
};
