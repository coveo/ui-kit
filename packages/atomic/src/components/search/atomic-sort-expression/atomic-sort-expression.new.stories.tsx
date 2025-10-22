import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit/static-html.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

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
