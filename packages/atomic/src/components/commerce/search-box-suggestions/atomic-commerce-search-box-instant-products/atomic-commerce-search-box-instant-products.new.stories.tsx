import {wrapInCommerceInterface} from '@coveo/atomic-storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit/static-html.js';

const {decorator, play} = wrapInCommerceInterface({skipFirstSearch: true});

const meta: Meta = {
  component: 'atomic-commerce-search-box-instant-products',
  title:
    'Atomic-Commerce/Interface Components/atomic-commerce-search-box-instant-products',
  id: 'atomic-commerce-search-box-instant-products',
  render: renderComponent,
  decorators: [decorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-commerce-numeric-facet',
  decorators: [
    (story) => {
      return html`<div id="code-root">
        <atomic-commerce-search-box>
          <atomic-commerce-search-box-query-suggestions></atomic-commerce-search-box-query-suggestions>
          ${story()}
        </atomic-commerce-search-box>
      </div>`;
    },
  ],
};
