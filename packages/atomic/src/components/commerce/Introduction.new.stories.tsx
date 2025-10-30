import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

const meta: Meta = {
  title: 'Commerce',
  id: 'commerce-introduction',
};

export default meta;

export const Introduction: StoryObj = {
  name: 'Introduction',
  render: () => html`
    <div style="font-family: 'Nunito Sans', sans-serif; max-width: 800px; padding: 20px;">
      <h1>Commerce Components</h1>
      
      <p>Welcome to the Atomic Commerce component library!</p>
      
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">
      
    </div>
  `,
  parameters: {
    docs: {
      disable: true,
    },
  },
};
