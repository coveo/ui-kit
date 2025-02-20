import {
  wrapInCommerceInterface,
  playExecuteFirstSearch,
  playKeepOnlyFirstFacetOfType,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';

const {play, decorator} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-commerce-category-facet',
  title: 'Atomic-Commerce/CategoryFacet',
  id: 'atomic-commerce-category-facet',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-category-facet',
  decorators: [
    (_) => {
      return html`<div id="code-root">
        <atomic-commerce-facets></atomic-commerce-facets>
      </div>`;
    },
  ],
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
    playKeepOnlyFirstFacetOfType('atomic-commerce-category-facet', context);
  },
};
