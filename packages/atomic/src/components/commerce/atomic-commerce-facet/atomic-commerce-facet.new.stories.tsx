import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import {commerceFacetWidthDecorator} from '@/storybook-utils/commerce/commerce-facet-width-decorator';
import {
  playHideFacetTypes,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {play, decorator} = wrapInCommerceInterface();

const meta: Meta = {
  component: 'atomic-commerce-facet',
  title: 'Commerce/Facet (Regular)',
  id: 'atomic-commerce-facet',
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
    await playHideFacetTypes('atomic-commerce-facet', context);
  },
};
