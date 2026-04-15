import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import '@/cdn/atomic.esm.js';

import {meta as metaCommon} from './common.js';
const meta: Meta = {
  ...metaCommon,
  component: 'lazy-rich-search-page',
  title: 'Search/Example Pages',
  id: 'lazy-rich-search-page',
  // tags: ['dev'],
};
export default meta;

export const Default: Story = {
  name: 'Search Page with Lazy Loading',
};
