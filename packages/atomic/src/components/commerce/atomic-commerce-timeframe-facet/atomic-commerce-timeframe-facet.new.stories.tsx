import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {commerceFacetWidthDecorator} from '@/storybook-utils/commerce/commerce-facet-width-decorator';
import {
  hideFacetTypesHook,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

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
  includeCodeRoot: false,
});
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-timeframe-facet',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-timeframe-facet',
  title: 'Commerce/Facet (Timeframe)',
  id: 'atomic-commerce-timeframe-facet',
  render: (args) => template(args),
  decorators: [commerceFacetWidthDecorator, decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
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
    await hideFacetTypesHook('atomic-commerce-timeframe-facet', context);
  },
};
