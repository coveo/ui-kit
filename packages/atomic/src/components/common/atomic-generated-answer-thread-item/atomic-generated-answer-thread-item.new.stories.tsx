import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {userEvent} from 'storybook/test';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/common/atomic-generated-answer-thread-item/atomic-generated-answer-thread-item.js';

const meta: Meta = {
  component: 'atomic-generated-answer-thread-item',
  title: 'Search/Generated Answer Thread Item',
  id: 'atomic-generated-answer-thread-item',
  render: (args) => {
    const wrapper = document.createElement('ul');
    wrapper.className = 'm-0 list-none p-0';

    const element = document.createElement(
      'atomic-generated-answer-thread-item'
    ) as HTMLElement & Record<string, unknown>;
    element.title = args.title;
    element.disableCollapse =
      args.disableCollapse ?? args['disable-collapse'] ?? false;
    element.hideLine = args.hideLine ?? args['hide-line'] ?? false;
    element.isExpanded = args.isExpanded ?? args['is-expanded'] ?? false;
    element.showTimelineDot =
      args.showTimelineDot ?? args['show-timeline-dot'] ?? true;

    const content = document.createElement('p');
    content.textContent =
      'Follow-up guidance and context for this generated answer thread item.';
    content.className = 'm-0 text-sm';

    element.appendChild(content);
    wrapper.appendChild(element);

    return wrapper;
  },
  parameters: {
    ...parameters,
    actions: {handles: ['click']},
  },
  args: {
    title: 'What else should I try if this fails?',
    disableCollapse: false,
    hideLine: false,
    isExpanded: true,
    showTimelineDot: true,
  },
  argTypes: {
    title: {control: 'text'},
    disableCollapse: {control: 'boolean'},
    hideLine: {control: 'boolean'},
    isExpanded: {control: 'boolean'},
    showTimelineDot: {control: 'boolean'},
  },
};

export default meta;

export const Default: Story = {};

export const ThreadTimelineCollapsible: Story = {
  name: 'Thread Timeline Collapsible',
  parameters: {
    a11y: {disable: true},
  },
  play: async (storyContext) => {
    const threadItem = storyContext.canvasElement.querySelector(
      'atomic-generated-answer-thread-item:not([disable-collapse])'
    ) as HTMLElement | null;
    const timelineToggle = threadItem?.shadowRoot?.querySelector(
      'div.items-center.justify-center'
    ) as HTMLElement | null;

    if (!timelineToggle) {
      throw new Error('Could not find timeline toggle for thread item');
    }

    await userEvent.click(timelineToggle);
  },
};
