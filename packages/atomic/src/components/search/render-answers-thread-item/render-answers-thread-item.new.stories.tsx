import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html, nothing} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderAnswersThreadItem} from './render-answers-thread-item';

type StoryArgs = {
  title: string;
  isCollapsible: boolean;
  isExpanded: boolean;
  hideLine: boolean;
  withActions: boolean;
};

const meta: Meta<StoryArgs> = {
  title: 'Search/Generated Answer Thread Item',
  id: 'render-answers-thread-item',
  render: (args) => {
    const actions = args.withActions
      ? html`<div class="flex items-center gap-2">
          <button class="btn-text-primary" aria-label="Like">👍</button>
          <button class="btn-text-primary" aria-label="Dislike">👎</button>
          <button class="btn-text-primary" aria-label="Copy">📋</button>
        </div>`
      : nothing;

    return html`<div data-testid="answers-thread-item" class="max-w-3xl">
      ${renderAnswersThreadItem({
        props: {
          title: args.title,
          isCollapsible: args.isCollapsible,
          isExpanded: args.isExpanded,
          hideLine: args.hideLine,
          actions,
        },
      })(html`
        <div class="text-on-background">
          Safeguards against misinformation and bias in AI-generated snippets
          start with rigorous content validation and transparent source
          attribution.
        </div>
      `)}
    </div>`;
  },
  parameters,
  argTypes: {
    title: {control: 'text'},
    isCollapsible: {control: 'boolean'},
    isExpanded: {control: 'boolean'},
    hideLine: {control: 'boolean'},
    withActions: {control: 'boolean'},
  },
  args: {
    title: 'what are they for',
    isCollapsible: true,
    isExpanded: true,
    hideLine: false,
    withActions: true,
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
