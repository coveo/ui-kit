import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components';
import {html} from 'lit';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {decorator, play} = wrapInCommerceInterface({skipFirstRequest: true});

const normalWidthDecorator: Decorator = (story) =>
  html` <div style="min-width: 600px;">${story()}</div> `;

const meta: Meta = {
  component: 'atomic-commerce-search-box',
  title: 'Commerce/Search Box',
  id: 'atomic-commerce-search-box',
  render: renderComponent,
  decorators: [normalWidthDecorator, decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {};

export const RichSearchBox: Story = {
  name: 'With suggestions, recent queries and instant products',
  args: {
    'slots-default': ` <atomic-commerce-search-box-recent-queries></atomic-commerce-search-box-recent-queries>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      <atomic-commerce-search-box-instant-products
        image-size="small"
      ></atomic-commerce-search-box-instant-products>`,
  },
};

export const StandaloneSearchBox: Story = {
  name: 'As a standalone search box',
  args: {
    'attributes-redirection-url':
      './iframe.html?id=atomic-commerce-search-box--in-page&viewMode=story&args=enable-query-syntax:!true;suggestion-timeout:5000',
  },
};
