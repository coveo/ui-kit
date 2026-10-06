import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {MockCommerceApi} from '@coveo/platform-mock-api/commerce';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {
  enableSpotlightContent,
  spotlightContentTransformer,
} from '@/storybook-utils/commerce/spotlight-content';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface.js';
import '@/src/components/commerce/atomic-spotlight-content-template/atomic-spotlight-content-template.js';

const commerceApiHarness = new MockCommerceApi();
commerceApiHarness.searchEndpoint.addRequestTransformer(spotlightContentTransformer([0, 2]));

const {decorator: commerceInterfaceDecorator, play: initializeCommerceInterface} =
  wrapInCommerceInterface({
    engineConfig: {
      preprocessRequest: (request) => {
        const parsed = JSON.parse(request.body as string);
        parsed.perPage = 2;
        request.body = JSON.stringify(parsed);
        return request;
      },
    },
    includeCodeRoot: false,
  });

const {decorator: commerceProductListDecorator} = wrapInCommerceProductList('grid', false);
const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-spotlight-content-template',
  {
    excludeCategories: ['methods'],
  }
);

const meta: Meta = {
  component: 'atomic-spotlight-content-template',
  title: 'Commerce/Spotlight Content Template',
  id: 'atomic-spotlight-content-template',
  render: (args) => template(args),
  decorators: [commerceProductListDecorator, commerceInterfaceDecorator],
  parameters: {
    ...parameters,
    msw: {handlers: [...commerceApiHarness.handlers]},
    actions: {
      handles: events,
    },
  },
  args,
  argTypes,
  play: async (context) => {
    await enableSpotlightContent(context);
    await initializeCommerceInterface(context);
  },
  beforeEach: () => {
    commerceApiHarness.clearAll();
  },
};

export default meta;

export const Default: Story = {
  name: 'atomic-spotlight-content-template',
  args: {
    'default-slot': `<template>
  <atomic-spotlight-content-image></atomic-spotlight-content-image>
  <atomic-spotlight-content-link>
    <atomic-spotlight-content-text field="name"></atomic-spotlight-content-text>
  </atomic-spotlight-content-link>
  <atomic-spotlight-content-text field="description"></atomic-spotlight-content-text>
</template>`,
  },
};

export const WithConditions: Story = {
  name: 'With conditions',
  render: () => html`
    <atomic-spotlight-content-template must-match-id="spotlight-summer-sale">
      <template>
        <atomic-spotlight-content-link>
          <atomic-spotlight-content-image></atomic-spotlight-content-image>
        </atomic-spotlight-content-link>
      </template>
    </atomic-spotlight-content-template>
  `,
};
