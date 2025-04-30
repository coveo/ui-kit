import type {Meta, StoryObj} from '@storybook/web-components';

const meta: Meta = {
  component: 'Introduction',
  title: 'Introduction',
};

export default meta;

export const Default: StoryObj = {
  name: 'Default',
  render: () => '<h1>Welcome to the Coveo Atomic Storybook</h1>',
  // Would be nice to hide the panel, but not currently possible
  // https://github.com/storybookjs/storybook/issues/14442
};

export const Crawling: StoryObj = {
  name: 'Crawling',
  tags: ['!dev'],
};
