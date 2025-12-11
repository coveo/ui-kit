import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-smart-snippet-collapse-wrapper',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-smart-snippet-collapse-wrapper',
  title: 'Common/SmartSnippets/Collapse Wrapper',
  id: 'atomic-smart-snippet-collapse-wrapper',
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
  name: 'Without Maximum Height',
  args: {
    'default-slot': `
      <div style="padding: 16px; background: #f5f5f5;">
        <p>This is some content that will not be collapsed.</p>
        <p>Since no maximum height is set, the expand/collapse button will not appear.</p>
      </div>
    `,
  },
};

export const WithCollapseButton: Story = {
  name: 'With Collapse Button',
  args: {
    'maximum-height': 200,
    'collapsed-height': 100,
    'default-slot': `
      <div style="padding: 16px; background: #f5f5f5; line-height: 1.6;">
        <p>This is a longer piece of content that exceeds the maximum height.</p>
        <p>The component will initially be collapsed to 100px height.</p>
        <p>A "Show more" button will appear at the bottom.</p>
        <p>Clicking it will expand the content to its full height.</p>
        <p>The button will then change to "Show less".</p>
        <p>This pattern is commonly used for smart snippet answers.</p>
        <p>It helps conserve vertical space while allowing users to see the full content when needed.</p>
        <p>The gradient fade effect helps indicate there's more content below.</p>
      </div>
    `,
  },
};

export const ShortContent: Story = {
  name: 'Short Content (Button Hidden)',
  args: {
    'maximum-height': 300,
    'collapsed-height': 150,
    'default-slot': `
      <div style="padding: 16px; background: #f5f5f5; line-height: 1.6;">
        <p>This is short content.</p>
        <p>Since it doesn't exceed the maximum height, the button won't appear.</p>
      </div>
    `,
  },
};

export const CustomGradient: Story = {
  name: 'With Custom Gradient',
  args: {
    'maximum-height': 250,
    'collapsed-height': 120,
    'default-slot': `
      <div style="padding: 16px; background: #f5f5f5; line-height: 1.6;">
        <p>You can customize the gradient fade-out effect using CSS variables.</p>
        <p>The --atomic-smart-snippet-gradient-start variable controls where the fade begins.</p>
        <p>This allows fine-tuning of the visual transition between collapsed and expanded states.</p>
        <p>The default calculation ensures the gradient starts at an appropriate point.</p>
        <p>But you can override it for specific use cases or design requirements.</p>
        <p>The fade helps users understand there's more content without an abrupt cutoff.</p>
      </div>
    `,
  },
  decorators: [
    (story) => `
      <style>
        atomic-smart-snippet-collapse-wrapper {
          --atomic-smart-snippet-gradient-start: 80px;
        }
      </style>
      ${story()}
    `,
  ],
};
