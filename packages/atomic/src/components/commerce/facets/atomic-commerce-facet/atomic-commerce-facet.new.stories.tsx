import {
  wrapInCommerceInterface,
  playExecuteFirstSearch,
  playKeepOnlyFirstFacetOfType,
} from '@coveo/atomic/storybookUtils/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic/storybookUtils/common-meta-parameters';
import {renderComponent} from '@coveo/atomic/storybookUtils/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit-html';

const {play, decorator} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-commerce-facet',
  title: 'Atomic-Commerce/Facet',
  id: 'atomic-commerce-facet',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-facet',
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
    playKeepOnlyFirstFacetOfType('atomic-commerce-facet', context);
  },
};
