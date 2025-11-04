import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const meta: Meta = {
  component: 'atomic-focus-trap',
  title: 'Atomic/Internal/FocusTrap',
};

export default meta;

export const Default: Story = {
  name: 'atomic-focus-trap',
  render: () => html`
    <atomic-focus-trap>
      <button>Focusable button inside trap</button>
    </atomic-focus-trap>
  `,
};
