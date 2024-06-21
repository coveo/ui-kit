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
    (story) => {
      /*let style = '<style>';
      Object.entries(context.args).forEach(([key, value]) => {
        console.log(key, value);
        style += `atomic-commerce-facet::${key.split('css-part')[1]} {${value.toString()}}`;
      });
      style += '</style>';
      console.log(style);*/

      return html`${story()}<atomic-commerce-facets></atomic-commerce-facets>`;
    },
  ],
  play: async (context) => {
    await play(context);
    await playExecuteFirstSearch(context);
    playKeepOnlyFirstFacetOfType('atomic-commerce-facet', context);
  },
};
