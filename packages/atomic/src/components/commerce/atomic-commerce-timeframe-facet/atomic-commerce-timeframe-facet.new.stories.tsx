import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {html} from 'lit';
import {commerceFacetWidthDecorator} from '@/storybook-utils/commerce/commerce-facet-width-decorator';
import {
  playHideFacetTypes,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {play, decorator} = wrapInCommerceInterface({
  engineConfig: {
    context: {
      country: 'US',
      currency: 'USD',
      language: 'en',
      view: {
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing',
      },
    },
  },
  type: 'product-listing',
});

const meta: Meta = {
  component: 'atomic-commerce-timeframe-facet',
  title: 'Commerce/Facet (Timeframe)',
  id: 'atomic-commerce-timeframe-facet',
  render: renderComponent,
  decorators: [commerceFacetWidthDecorator, decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  decorators: [
    (_) => {
      return html`<div id="code-root">
        <atomic-commerce-facets></atomic-commerce-facets>
      </div>`;
    },
  ],
  play: async (context) => {
    await play(context);
    await playHideFacetTypes('atomic-commerce-timeframe-facet', context);
  },
};
