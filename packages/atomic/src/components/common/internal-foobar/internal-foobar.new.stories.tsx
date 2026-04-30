import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html, LitElement} from 'lit';

class AtomicInternalFoobar extends LitElement {
  render() {
    return html`<button></button>`;
  }
}

if (
  typeof customElements !== 'undefined' &&
  !customElements.get('atomic-internal-foobar')
) {
  customElements.define('atomic-internal-foobar', AtomicInternalFoobar);
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-internal-foobar': AtomicInternalFoobar;
  }
}

const meta: Meta = {
  component: 'atomic-internal-foobar',
  title: 'Internal/Foobar',
  id: 'internal-foobar',
  parameters: {
    chromatic: {disableSnapshot: false},
    a11y: {test: 'todo'},
  },
  tags: ['!dev', '!autodocs', '!test'],
};

export default meta;

export const IntentionalA11yViolation: Story = {
  name: 'Intentional a11y violation',
  render: () => html`<atomic-internal-foobar></atomic-internal-foobar>`,
};
