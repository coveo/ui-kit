import {
  wrapInCommerceInterface,
  playExecuteFirstSearch,
  playKeepOnlyFirstFacetOfType,
} from '@coveo/atomic/storybookUtils/commerce/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html';

const {play, decorator} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-commerce-numeric-facet',
  title: 'Atomic-Commerce/NumericFacet',
  id: 'atomic-commerce-numeric-facet',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-numeric-facet',
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
    playKeepOnlyFirstFacetOfType('atomic-commerce-numeric-facet', context);
  },
};
