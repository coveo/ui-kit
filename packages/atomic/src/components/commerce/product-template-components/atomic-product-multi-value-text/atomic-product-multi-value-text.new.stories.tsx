import {wrapInCommerceInterface} from '@coveo/atomic-storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@coveo/atomic-storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@coveo/atomic-storybook-utils/common/render-component';
import {wrapInProduct} from '@coveo/atomic-storybook-utils/product-wrapper';
import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {render} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import {html} from 'lit/static-html.js';

const baseConfiguration = getSampleCommerceEngineConfiguration();

const {decorator: productDecorator} = wrapInProduct();
const {decorator: commerceInterfaceDecorator, play} = wrapInCommerceInterface({
  engineConfig: {
    ...baseConfiguration,
    context: {
      ...baseConfiguration.context,
      view: {
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing-product-multi-value-text',
      },
    },
  },
  type: 'product-listing',
});

const meta: Meta = {
  component: 'atomic-product-multi-value-text',
  title: 'Atomic-Commerce/Product Template Components/MultiValueText',
  id: 'atomic-product-multi-value-text',
  render: renderComponent,
  decorators: [commerceInterfaceDecorator],
  parameters,
  play,
};

export default meta;

export const Default: Story = {
  name: 'atomic-product-multi-value-text',
  args: {
    'attributes-field': 'cat_available_sizes',
  },
  decorators: [productDecorator],
};

const {play: playSkipFirstSearch} = wrapInCommerceInterface({
  skipFirstSearch: true,
});

export const BeforeFirstRequest: Story = {
  name: 'Before first request',
  decorators: [productDecorator],
  play: playSkipFirstSearch,
};

export const WithMaxValuesToDisplay: Story = {
  name: 'With max values to display',
  args: {
    'attributes-field': 'cat_available_sizes',
    'attributes-max-values-to-display': 1,
  },
  decorators: [productDecorator],
};

export const InPage: Story = {
  name: 'In a page',
  args: {
    'attributes-field': 'cat_available_sizes',
  },
  decorators: [
    (story) => {
      const tempProductTemplate = document.createElement('div');
      render(html` ${story()}`, tempProductTemplate);
      tempProductTemplate.replaceChildren(
        ...Array.from(tempProductTemplate.children)
      );
      return html`
        <atomic-commerce-layout>
          <atomic-layout-section section="facets"
            ><atomic-commerce-facets></atomic-commerce-facets>
          </atomic-layout-section>
          <atomic-layout-section section="main">
            <atomic-commerce-product-list
              display="list"
              density="normal"
              image-size="icon"
              style="border: 2px dashed black; padding:20px;"
            >
              <atomic-product-template>
                ${unsafeHTML(
                  `<template>${tempProductTemplate.innerHTML}</template>`
                )}
              </atomic-product-template>
            </atomic-commerce-product-list>
          </atomic-layout-section>
        </atomic-commerce-layout>
      `;
    },
  ],
};
