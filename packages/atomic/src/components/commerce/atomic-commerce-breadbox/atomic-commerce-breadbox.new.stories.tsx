import {
  type CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {context, ...restOfConfiguration} =
  getSampleCommerceEngineConfiguration();

const productListingEngineConfiguration: Partial<CommerceEngineConfiguration> =
  {
    context: {
      ...context,
      country: 'US',
      currency: 'USD',
      language: 'en',
      view: {
        url: `${context.view.url}/browse/promotions/ui-kit-testing`,
      },
    },
    ...restOfConfiguration,
  };

const {decorator, play} = wrapInCommerceInterface({
  engineConfig: productListingEngineConfiguration,
  type: 'product-listing',
});

const meta: Meta = {
  component: 'atomic-commerce-breadbox',
  title: 'Commerce/Breadbox',
  id: 'atomic-commerce-breadbox',
  render: renderComponent,
  decorators: [decorator],
  parameters: {
    ...parameters,
    layout: 'fullscreen',
  },
  play,
};

export default meta;

export const Default: Story = {
  decorators: [
    (story) => html`
      ${story()}
      <div style="margin:20px 0">
        Select facet value(s) to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-commerce-facets> </atomic-commerce-facets>
      </div>
    `,
  ],
};
