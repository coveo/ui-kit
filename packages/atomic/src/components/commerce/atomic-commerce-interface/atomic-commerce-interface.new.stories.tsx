import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {html} from 'lit';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

async function initializeCommerceInterface(canvasElement: HTMLElement) {
  await customElements.whenDefined('atomic-commerce-interface');
  const commerceInterface = canvasElement.querySelector(
    'atomic-commerce-interface'
  );
  await commerceInterface!.initialize(getSampleCommerceEngineConfiguration());
}

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-interface',
  {excludeCategories: ['methods']}
);

const meta: Meta = {
  component: 'atomic-commerce-interface',
  title: 'Commerce/Interface',
  id: 'atomic-commerce-interface',
  render: (args) => template(args),
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  decorators: [(story) => html`<div id="code-root">${story()}</div>`],

  play: async (context) => {
    await initializeCommerceInterface(context.canvasElement);
    const searchInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    await searchInterface!.executeFirstRequest();
  },
  argTypes: {
    ...argTypes,
    engine: {
      ...argTypes,
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
    urlManager: {
      ...argTypes.urlManager,
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
    i18n: {
      ...argTypes.i18n,
      control: {
        disable: true,
      },
      table: {
        defaultValue: {summary: undefined},
      },
    },
  },
  args: {
    ...args,
    engine: undefined,
    i18n: undefined,
    urlManager: undefined,
    language: 'en',
    'default-slot': `<span>Interface content</span>`,
  },
};

export default meta;

export const Default: Story = {};

export const SearchBeforeInit: Story = {
  tags: ['!dev'],
  play: async (context) => {
    const commerceInterface = context.canvasElement.querySelector(
      'atomic-commerce-interface'
    );
    await customElements.whenDefined('atomic-commerce-interface');
    await commerceInterface!.executeFirstRequest();
  },
};

export const WithProductList: Story = {
  args: {
    'default-slot': `
      <atomic-commerce-layout>
        <atomic-layout-section section="search">
          <atomic-commerce-search-box></atomic-commerce-search-box>
        </atomic-layout-section>
        <atomic-layout-section section="facets">
          <atomic-commerce-facets></atomic-commerce-facets>
        </atomic-layout-section>
        <atomic-layout-section section="main">
          <atomic-layout-section section="status">
            <atomic-commerce-breadbox></atomic-commerce-breadbox>
            <atomic-commerce-query-summary></atomic-commerce-query-summary>
            <atomic-commerce-sort-dropdown></atomic-commerce-sort-dropdown>
          </atomic-layout-section>
          <atomic-layout-section section="products">
            <atomic-commerce-product-list
              display="grid"
              density="compact"
              image-size="small"
            ></atomic-commerce-product-list>
            <atomic-commerce-query-error></atomic-commerce-query-error>
          </atomic-layout-section>
          <atomic-layout-section section="pagination">
            <atomic-commerce-pager></atomic-commerce-pager>
            <atomic-commerce-products-per-page>
            </atomic-commerce-products-per-page>
          </atomic-layout-section>
        </atomic-layout-section>
      </atomic-commerce-layout>
    `,
  },
};
