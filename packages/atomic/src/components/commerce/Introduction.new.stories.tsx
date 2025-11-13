import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

const meta: Meta = {
  title: 'Commerce/Introduction',
  id: 'commerce-introduction',
};

export default meta;

export const Introduction: StoryObj = {
  name: 'Introduction',
  render: () => html`
    <div style="font-family: 'Nunito Sans', sans-serif; max-width: 800px; padding: 20px;">
      <h1>Atomic Commerce Components</h1>
      
      <p>
        This section showcases interactive documentation for the <a href="https://docs.coveo.com/en/p8bd0068" target="_blank">Coveo Atomic for Commerce</a> components.
      </p>

      <br>

      <h2>Getting Started</h2>
      <p>
        Begin by exploring the individual components in the sidebar. Each component includes:
      </p>
      <ul>
        <li>Interactive examples with configurable properties</li>
        <li>Code snippets showing implementation details</li>
        <li>Documentation for available attributes and events</li>
      </ul>

      <p>You can find full page examples in the <strong>Example Pages</strong> section.</p>

    </div>
  `,
  parameters: {
    docs: {
      disable: true,
    },
  },
};
