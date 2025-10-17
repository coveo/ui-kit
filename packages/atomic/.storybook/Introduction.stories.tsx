import type {Meta, StoryObj} from '@storybook/web-components-vite';
import {html} from 'lit';

const meta: Meta = {
  component: 'Introduction',
  title: 'Introduction',
};

export default meta;

export const Default: StoryObj = {
  name: 'Default',
  render: () => html`
    <div style="font-family: 'Nunito Sans', sans-serif;">
      <h1>Welcome to the Coveo Atomic Storybook</h1>
      <p>
        This Storybook showcases interactive documentation for the <a href="https://docs.coveo.com/en/atomic/latest" target="_blank">Coveo Atomic library</a>.
      </p>
      <p>
        Navigate through the components on the left sidebar to learn how to use them.
      </p>
    </div>
  `,
  // It would be nice to hide the panel, but it isn't currently possible
  // https://github.com/storybookjs/storybook/issues/14442
};

export const Crawling: StoryObj = {
  name: 'Crawling',
  tags: ['!dev', '!test'],
};
