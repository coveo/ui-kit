import type {Meta, StoryObj} from '@storybook/web-components';
import {html} from 'lit';

const meta: Meta = {
  component: 'Crawling',
  title: 'Crawling',
  tags: ['!sidebar', '!dev'],
};

export default meta;

/**
 * Hidden story used for search engine crawling.
 * Expands all sidebar folders so crawlers can discover all component links.
 * Not visible in dev mode or sidebar navigation.
 */
export const Crawling: StoryObj = {
  render: () => html`
    <div style="font-family: 'Nunito Sans', sans-serif; padding: 20px;">
      <h1>Coveo Atomic Component Index</h1>
      <p>This page is used for search engine indexing. All component folders have been expanded in the sidebar for discovery.</p>
    </div>
  `,
};
