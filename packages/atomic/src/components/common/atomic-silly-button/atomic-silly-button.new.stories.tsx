import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/common/atomic-silly-button/atomic-silly-button.js';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {within} from 'shadow-dom-testing-library';
import {userEvent, waitFor} from 'storybook/test';

const {args, argTypes, template} = getStorybookHelpers('atomic-silly-button', {
  excludeCategories: ['methods'],
});

const meta: Meta = {
  component: 'atomic-silly-button',
  title: 'Common/Silly Button',
  id: 'atomic-silly-button',
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

export const Default: Story = {
  name: 'Demo buttom',
  parameters: {
    pseudo: {
      hover: true,
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const button = await canvas.findByShadowRole('button');
    console.log('play!');
    await userEvent.click(button);
  },
};
