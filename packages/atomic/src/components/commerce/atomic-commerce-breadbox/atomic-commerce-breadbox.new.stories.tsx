import {
  playExecuteFirstSearch,
  wrapInCommerceInterface,
} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import {CommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const productListingEngineConfiguration: Partial<CommerceEngineConfiguration> =
  {
    context: {
      country: 'US',
      currency: 'USD',
      language: 'en',
      view: {
        url: 'https://sports-dev.barca.group/browse/promotions/ui-kit-testing',
      },
    },
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
