import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import type {
  Decorator,
  Meta,
  StoryObj as Story,
} from '@storybook/web-components';
import {html} from 'lit';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: true});

const wrapInSearchBox: Decorator = (story) => {
  return html`
    <atomic-commerce-search-box>
      <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
      ${story()}
    </atomic-commerce-search-box>
  `;
};

const meta: Meta = {
  component: 'atomic-commerce-search-box-instant-products',
  title:
    'Atomic-Commerce/Interface Components/atomic-commerce-search-box-instant-products',
  id: 'atomic-commerce-search-box-instant-products',
  render: renderComponent,
  decorators: [wrapInSearchBox, decorator],
  parameters,
  play,
  argTypes: {
    'attributes-density': {
      name: 'density',
      options: ['normal', 'comfortable', 'compact'],
    },
    'attributes-image-size': {
      name: 'image-size',
      options: ['icon', 'small', 'large', 'none'],
    },
    'attributes-aria-label-generator': {
      name: 'aria-label-generator',
      type: 'function',
    },
  },
};

export const WithComfortableDensity: Story = {
  tags: ['test'],
  name: 'With comfortable density',
  args: {
    'attributes-density': 'comfortable',
  },
};

export const WithNoImage: Story = {
  tags: ['test'],
  name: 'With no image',
  args: {
    'attributes-image-size': 'none',
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-search-box-instant-product',
};
