import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import './atomic-result-table-placeholder';

const meta: Meta = {
  component: 'atomic-result-table-placeholder',
  title: 'Search/Internal/Result Table Placeholder',
  id: 'atomic-result-table-placeholder',
  tags: ['internal'],

  render: (args) => html`
    <atomic-result-table-placeholder
      .density=${args.density}
      .imageSize=${args.imageSize}
      .rows=${args.rows}
    ></atomic-result-table-placeholder>
  `,

  args: {
    density: 'normal',
    imageSize: 'icon',
    rows: 3,
  },

  argTypes: {
    density: {
      control: {type: 'select'},
      options: ['comfortable', 'normal', 'compact'],
      description: 'The display density for the table',
    },
    imageSize: {
      control: {type: 'select'},
      options: ['large', 'small', 'icon', 'none'],
      description: 'The image size for the table',
    },
    rows: {
      control: {type: 'number', min: 1, max: 20},
      description: 'The number of rows to display in the placeholder',
    },
  },
};

export default meta;

export const Default: Story = {};

export const SingleRow: Story = {
  args: {
    rows: 1,
  },
};

export const ManyRows: Story = {
  args: {
    rows: 10,
  },
};

export const ComfortableDensity: Story = {
  args: {
    density: 'comfortable',
    rows: 5,
  },
};

export const CompactDensity: Story = {
  args: {
    density: 'compact',
    rows: 5,
  },
};

export const LargeImages: Story = {
  args: {
    imageSize: 'large',
    rows: 3,
  },
};

export const NoImages: Story = {
  args: {
    imageSize: 'none',
    rows: 3,
  },
};
