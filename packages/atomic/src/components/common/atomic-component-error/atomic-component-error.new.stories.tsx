import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {wrapInSearchInterface} from '@/storybook-utils/search/search-interface-wrapper';

const {decorator, play} = wrapInSearchInterface();
const {events, args, argTypes} = getStorybookHelpers('atomic-component-error', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-component-error',
  title: 'Common/Component Error',
  id: 'atomic-component-error',

  render: (args) => {
    const element = document.createElement('atomic-component-error');
    element.error = args.error;
    element.element = args.element;
    return element;
  },
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
  name: 'atomic-component-error',
  args: {
    error: new Error('This is an error'),
    element: document.createElement('some-element'),
  },
  decorators: [(story) => html` ${story()}`],
  play: async (context) => {
    await play(context);
  },
};
