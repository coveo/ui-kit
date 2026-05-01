import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html, LitElement} from 'lit';

class AtomicInternalFoobar extends LitElement {
  render() {
    return html`<button></button>`;
  }
}

if (
  typeof customElements !== 'undefined' &&
  !customElements.get('atomic-internal-foobar-baz')
) {
  customElements.define('atomic-internal-foobar-baz', AtomicInternalFoobar);
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-internal-foobar-baz': AtomicInternalFoobar;
  }
}

const meta: Meta = {
  component: 'atomic-internal-foobar-baz',
  title: 'Internal/Foobar',
  id: 'internal-foobar-baz',
  parameters: {
    chromatic: {disableSnapshot: false},
  },
  tags: ['!dev', '!autodocs', '!test'],
};

export default meta;

export const IntentionalA11yViolation: Story = {
  name: 'Intentional a11y violation',
  render: () => html`<atomic-internal-foobar-baz></atomic-internal-foobar-baz>`,
};
