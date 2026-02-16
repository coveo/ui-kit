import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

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
