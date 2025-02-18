import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import {
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

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
        url: context.view.url + '/browse/promotions/ui-kit-testing',
      },
    },
    ...restOfConfiguration,
  };

const {decorator, play} = wrapInCommerceInterface({
  engineConfig: productListingEngineConfiguration,
  skipFirstSearch: true,
  type: 'product-listing',
});

const meta: Meta = {
  component: 'atomic-commerce-breadbox',
  title: 'Atomic-commerce/Interface Components/atomic-commerce-breadbox',
  id: 'atomic-commerce-breadbox',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-breadbox',
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
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
  },
};
