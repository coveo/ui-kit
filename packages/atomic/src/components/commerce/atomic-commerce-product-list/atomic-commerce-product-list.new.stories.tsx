import type {Meta, StoryObj as Story} from '@storybook/web-components-vite';
import {getStorybookHelpers} from '@wc-toolkit/storybook-helpers';
import {
  executeFirstRequestHook,
  wrapInCommerceInterface,
} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';

const {events, args, argTypes, template} = getStorybookHelpers(
  'atomic-commerce-product-list',
  {excludeCategories: ['methods']}
);

const {decorator, play} = wrapInCommerceInterface({
  skipFirstRequest: false,
  engineConfig: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.perPage = 4;
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});

const {play: playNoFirstQuery} = wrapInCommerceInterface({
  skipFirstRequest: true,
});

const {play: playNoProducts} = wrapInCommerceInterface({
  skipFirstRequest: false,
  engineConfig: {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.query = 'show me no products';
      request.body = JSON.stringify(parsed);
      return request;
    },
  },
});

const meta: Meta = {
  args: {
    ...args,
    'number-of-placeholders': 4,
    display: 'grid',
    density: 'normal',
    'image-size': 'small',
  },
  component: 'atomic-commerce-product-list',
  title: 'Commerce/Product List',
  id: 'atomic-commerce-product-list',
  render: (args) => template(args),
  decorators: [decorator],
  parameters: {
    ...parameters,
    actions: {
      handles: events,
    },
  },
  argTypes,
  play,
};

export default meta;

export const Default: Story = {
  name: 'Using grid display',
};

export const GridDisplayWithTemplate: Story = {
  name: 'Using grid display with template',
  args: {
    'default-slot': `<atomic-product-template>
  <template>
    <atomic-product-section-name id="product-name-section">
      <atomic-product-link class="font-bold"></atomic-product-link>
    </atomic-product-section-name>
    <atomic-product-section-visual>
      <atomic-product-field-condition if-defined="ec_thumbnails">
        <atomic-product-image field="ec_thumbnails"></atomic-product-image>
      </atomic-product-field-condition>
    </atomic-product-section-visual>
    <atomic-product-section-metadata>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand"></atomic-product-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="cat_available_sizes">
        <atomic-product-multi-value-text
          field="cat_available_sizes"
        ></atomic-product-multi-value-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="ec_rating">
        <atomic-product-rating field="ec_rating"></atomic-product-rating>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="concepts">
        <atomic-product-multi-value-text field="concepts"></atomic-product-multi-value-text>
      </atomic-product-field-condition>
    </atomic-product-section-metadata>
    <atomic-product-section-emphasized>
      <atomic-product-price currency="USD"></atomic-product-price>
    </atomic-product-section-emphasized>
    <atomic-product-section-description>
      <atomic-product-excerpt></atomic-product-excerpt>
    </atomic-product-section-description>
    <atomic-product-section-children>
      <atomic-product-children></atomic-product-children>
    </atomic-product-section-children>
  </template>
</atomic-product-template>`,
  },
};

export const GridDisplayBeforeQuery: Story = {
  name: 'Using grid display before query',
  play: async (context) => {
    await playNoFirstQuery(context);
  },
};

export const ListDisplay: Story = {
  name: 'Using list display',

  args: {
    display: 'list',
  },
};

export const ListDisplayWithTemplate: Story = {
  name: 'Using list display with template',

  args: {
    display: 'list',
    'default-slot': `<atomic-product-template>
  <template>
    <atomic-product-section-name id="product-name-section">
      <atomic-product-link class="font-bold"></atomic-product-link>
    </atomic-product-section-name>
    <atomic-product-section-visual>
      <atomic-product-field-condition if-defined="ec_thumbnails">
        <atomic-product-image field="ec_thumbnails"></atomic-product-image>
      </atomic-product-field-condition>
    </atomic-product-section-visual>
    <atomic-product-section-metadata>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand"></atomic-product-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="cat_available_sizes">
        <atomic-product-multi-value-text
          field="cat_available_sizes"
        ></atomic-product-multi-value-text>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="ec_rating">
        <atomic-product-rating field="ec_rating"></atomic-product-rating>
      </atomic-product-field-condition>
      <atomic-product-field-condition if-defined="concepts">
        <atomic-product-multi-value-text field="concepts"></atomic-product-multi-value-text>
      </atomic-product-field-condition>
    </atomic-product-section-metadata>
    <atomic-product-section-emphasized>
      <atomic-product-price currency="USD"></atomic-product-price>
    </atomic-product-section-emphasized>
    <atomic-product-section-description>
      <atomic-product-excerpt></atomic-product-excerpt>
    </atomic-product-section-description>
    <atomic-product-section-children>
      <atomic-product-children></atomic-product-children>
    </atomic-product-section-children>
  </template>
</atomic-product-template>`,
  },
};

export const ListDisplayBeforeQuery: Story = {
  name: 'Using list display before query',
  args: {
    display: 'list',
  },
  play: async (context) => {
    await playNoFirstQuery(context);
  },
};

export const TableDisplay: Story = {
  name: 'Using table display',

  args: {
    display: 'table',
    'default-slot': `<atomic-product-template>
  <template>
    <atomic-table-element label="Product">
      <atomic-product-link></atomic-product-link>
      <atomic-product-field-condition if-defined="ec_brand">
        <atomic-product-text field="ec_brand" class="text-neutral-dark block"></atomic-product-text>
      </atomic-product-field-condition>
    </atomic-table-element>
    <atomic-table-element label="ID">
      <atomic-product-text field="permanentid"></atomic-product-text>
    </atomic-table-element>
    <atomic-table-element label="Price">
      <atomic-product-price></atomic-product-price>
    </atomic-table-element>

  </template>
</atomic-product-template>`,
  },
};

export const TableDisplayBeforeQuery: Story = {
  name: 'Using table display before query',
  args: {
    display: 'table',
  },
  play: async (context) => {
    await playNoFirstQuery(context);
  },
};

export const NoProducts: Story = {
  tags: ['!dev'],
  name: 'No products',
  decorators: [(story) => story()],
  play: async (context) => {
    await playNoProducts(context);
    await executeFirstRequestHook(context);
  },
};
