import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderAnswersThreadItem} from './render-answers-thread-item';

type StoryArgs = {
  title: string;
  isCollapsible: boolean;
  isExpanded: boolean;
  hideLine: boolean;
};

const meta: Meta<StoryArgs> = {
  title: 'Search/Generated Answer Thread Item',
  id: 'render-answers-thread-item',
  render: (
    args
  ) => html`<div data-testid="answers-thread-item" class="max-w-3xl">
    ${renderAnswersThreadItem({
      props: {
        title: args.title,
        isCollapsible: args.isCollapsible,
        isExpanded: args.isExpanded,
        hideLine: args.hideLine,
      },
    })(html`
      <div class="text-on-background">
        Safeguards against misinformation and bias in AI-generated snippets
        start with rigorous content validation and transparent source
        attribution.
      </div>
    `)}
  </div>`,
  parameters,
  argTypes: {
    title: {control: 'text'},
    isCollapsible: {control: 'boolean'},
    isExpanded: {control: 'boolean'},
    hideLine: {control: 'boolean'},
  },
  args: {
    title: 'what are they for',
    isCollapsible: true,
    isExpanded: true,
    hideLine: false,
  },
};

export default meta;

export const Default: Story = {
  name: 'default',
};

export const Collapsed: Story = {
  name: 'collapsed',
  args: {isExpanded: false},
};

export const HideLine: Story = {
  name: 'hide-line',
  args: {hideLine: true},
};
