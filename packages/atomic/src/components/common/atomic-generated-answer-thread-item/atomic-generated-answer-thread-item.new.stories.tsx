import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {testDisclosureA11y} from '@/storybook-utils/a11y/disclosure.js';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/common/atomic-generated-answer-thread-item/atomic-generated-answer-thread-item.js';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {within} from 'shadow-dom-testing-library';
import {userEvent, waitFor} from 'storybook/test';

const {args, argTypes, template} = getStorybookHelpers(
  'atomic-generated-answer-thread-item',
  {
    excludeCategories: ['methods'],
  }
);

const meta: Meta = {
  component: 'atomic-generated-answer-thread-item',
  title: 'Search/Generated Answer Thread Item',
  id: 'atomic-generated-answer-thread-item',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    a11y: {disable: true},
  },
  args: {
    ...args,
    title: 'What else should I try if this fails?',
    disableCollapse: false,
    hideLine: false,
    isExpanded: false,
    showTimelineDot: true,
  },
  argTypes,
};

export default meta;

export const Default: Story = {};

export const Expanded: Story = {
  name: 'Expanded',
  args: {
    isExpanded: true,
  },
};

export const NonCollapsibleWithoutTimelineDot: Story = {
  name: 'Non-Collapsible without Timeline Dot',
  args: {
    hideLine: true,
    showTimelineDot: false,
    disableCollapse: true,
  },
};

export const NonCollapsibleWithoutTimeline: Story = {
  name: 'Non-Collapsible without Timeline',
  args: {
    hideLine: true,
    disableCollapse: true,
  },
};

export const HoverState: Story = {
  name: 'Hover State',
  args: {},
  parameters: {
    pseudo: {
      hover: true,
    },
  },
};

export const HoverStateBis: Story = {
  name: 'Hover State Bis',
  args: {
    title: 'what is a query',
  },
  play: async ({canvasElement}) => {
    await customElements.whenDefined('atomic-generated-answer-thread-item');
    const canvas = within(canvasElement);
    const threadItem = await canvas.findByShadowRole('listitem');

    const titleButton = threadItem.shadowRoot?.querySelector<HTMLButtonElement>(
      'button[type="button"]'
    );

    if (!titleButton) {
      throw new Error('Could not find thread item title button');
    }

    await userEvent.hover(titleButton);
  },
};

export const A11yDisclosure: Story = {
  tags: ['a11y', 'test', '!dev'],
  play: async (context) => {
    await testDisclosureA11y(context, {
      trigger: {expanded: false},
    });
  },
};
