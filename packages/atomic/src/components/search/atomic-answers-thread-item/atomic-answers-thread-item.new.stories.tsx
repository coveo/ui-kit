import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {MockSearchApi} from '@/storybook-utils/api/search/mock';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const searchApiHarness = new MockSearchApi();

const {decorator, play} = wrapInSearchInterface({
  skipFirstSearch: true,
  includeCodeRoot: false,
});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-answers-thread-item',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-answers-thread-item',
  title: 'Search/Generated Answer Thread Item',
  id: 'atomic-answers-thread-item',
  render: (storyArgs) => template(storyArgs),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
    msw: {handlers: [...searchApiHarness.handlers]},
  },
  args: {
    ...args,
    title: 'What are they for',
    'is-collapsible': true,
    'is-expanded': true,
    'hide-line': false,
    'default-slot': `
      <div class="text-on-background">
        Safeguards against misinformation and bias in AI-generated snippets start
        with rigorous content validation and transparent source attribution.
      </div>
    `,
  },
  argTypes,
  beforeEach: async () => {
    searchApiHarness.searchEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  name: 'default',
};

export const Collapsed: Story = {
  name: 'collapsed',
  args: {
    'is-expanded': false,
  },
};

export const HideLine: Story = {
  name: 'hide-line',
  args: {
    'hide-line': true,
  },
};
