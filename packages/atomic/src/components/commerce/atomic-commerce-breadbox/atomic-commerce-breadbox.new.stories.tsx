import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockCommerceApi} from '@/storybook-utils/api/commerce/mock';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const mockCommerceApi = new MockCommerceApi();

const {decorator, play} = wrapInCommerceInterface({
  type: 'product-listing',
  includeCodeRoot: false,
});

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-breadbox',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-breadbox',
  title: 'Commerce/Breadbox',
  id: 'atomic-commerce-breadbox',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    layout: 'fullscreen',
    actions: {
      handles: events,
    },
    msw: {handlers: [...mockCommerceApi.handlers]},
  },
  args,
  argTypes,
  beforeEach: () => {
    mockCommerceApi.productListingEndpoint.clear();
  },
  play,
};

export default meta;

export const Default: Story = {
  decorators: [
    (story) => html`
      <div id="code-root">${story()}</div>
      <div style="margin:20px 0">
        Select facet value(s) to see the Breadbox component.
      </div>
      <div style="display: flex; justify-content: flex-start;">
        <atomic-commerce-facets> </atomic-commerce-facets>
      </div>
    `,
  ],
};
