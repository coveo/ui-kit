import type {Meta, StoryObj as Story} from '@storybook/web-components';
import {html} from 'lit';
import {wrapInCommerceInterface} from '@/storybook-utils/commerce/commerce-interface-wrapper';
import {wrapInCommerceProductList} from '@/storybook-utils/commerce/commerce-product-list-wrapper';
import {wrapInProductTemplate} from '@/storybook-utils/commerce/commerce-product-template-wrapper';
import {parameters} from '@/storybook-utils/common/common-meta-parameters';
import {renderComponent} from '@/storybook-utils/common/render-component';

const {
  decorator: commerceInterfaceDecorator,
  play: initializeCommerceInterface,
} = wrapInCommerceInterface({
  skipFirstRequest: false,
  type: 'product-listing',
  engineConfig: {
    context: {
      view: {
        url: 'https://sports.barca.group/browse/promotions/ui-kit-testing',
      },
      language: 'en',
      country: 'US',
      currency: 'USD',
    },
  },
});
const {decorator: commerceProductListDecorator} = wrapInCommerceProductList();
const {decorator: productTemplateDecorator} = wrapInProductTemplate();

const meta: Meta = {
  component: 'atomic-product-numeric-field-value',
  title: 'Atomic-Commerce/Product Template Components/ProductNumericFieldValue',
  id: 'atomic-product-numeric-field-value',
  render: renderComponent,
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  parameters,
  play: initializeCommerceInterface,
  args: {
    'attributes-field': 'ec_rating',
  },
  argTypes: {
    'attributes-field': {
      name: 'field',
      description: 'The field name to display from the product data',
      control: 'text',
      type: 'string',
    },
  },
};

export default meta;

export const Default: Story = {
  name: 'Basic numeric field',
  args: {
    'attributes-field': 'ec_rating',
  },
};

export const WithCurrencyFormatting: Story = {
  name: 'With currency formatting',
  args: {
    'attributes-field': 'ec_price',
    'slots-default':
      '<atomic-format-currency currency="USD"></atomic-format-currency>',
  },
};

export const WithUnitFormatting: Story = {
  name: 'With unit formatting',
  args: {
    'attributes-field': 'weight',
    'slots-default': '<atomic-format-unit unit="kg"></atomic-format-unit>',
  },
};

export const WithCustomNumberFormatting: Story = {
  name: 'With custom number formatting',
  args: {
    'attributes-field': 'ec_rating',
    'slots-default':
      '<atomic-format-number maximum-fraction-digits="2"></atomic-format-number>',
  },
};

export const AllFormattingExamples: Story = {
  name: 'All formatting examples',
  render: () => html`
    <style>
      .example-container {
        padding: 20px;
        border: 1px solid #ccc;
        margin: 10px 0;
        border-radius: 8px;
      }
      .example-title {
        font-weight: bold;
        margin-bottom: 10px;
        color: #333;
      }
      .example-code {
        background: #f5f5f5;
        padding: 10px;
        margin: 10px 0;
        border-radius: 4px;
        font-family: monospace;
        font-size: 12px;
      }
    </style>
    <div class="example-container">
      <div class="example-title">Basic Rating Field</div>
      <atomic-product-numeric-field-value field="ec_rating"></atomic-product-numeric-field-value>
      <div class="example-code">&lt;atomic-product-numeric-field-value field="ec_rating"&gt;&lt;/atomic-product-numeric-field-value&gt;</div>
    </div>
    
    <div class="example-container">
      <div class="example-title">Price with Currency Formatting</div>
      <atomic-product-numeric-field-value field="ec_price">
        <atomic-format-currency currency="USD"></atomic-format-currency>
      </atomic-product-numeric-field-value>
      <div class="example-code">
        &lt;atomic-product-numeric-field-value field="ec_price"&gt;<br>
        &nbsp;&nbsp;&lt;atomic-format-currency currency="USD"&gt;&lt;/atomic-format-currency&gt;<br>
        &lt;/atomic-product-numeric-field-value&gt;
      </div>
    </div>
    
    <div class="example-container">
      <div class="example-title">Weight with Unit Formatting</div>
      <atomic-product-numeric-field-value field="weight">
        <atomic-format-unit unit="kg"></atomic-format-unit>
      </atomic-product-numeric-field-value>
      <div class="example-code">
        &lt;atomic-product-numeric-field-value field="weight"&gt;<br>
        &nbsp;&nbsp;&lt;atomic-format-unit unit="kg"&gt;&lt;/atomic-format-unit&gt;<br>
        &lt;/atomic-product-numeric-field-value&gt;
      </div>
    </div>
    
    <div class="example-container">
      <div class="example-title">Score with Custom Number Formatting</div>
      <atomic-product-numeric-field-value field="ec_rating">
        <atomic-format-number maximum-fraction-digits="2"></atomic-format-number>
      </atomic-product-numeric-field-value>
      <div class="example-code">
        &lt;atomic-product-numeric-field-value field="ec_rating"&gt;<br>
        &nbsp;&nbsp;&lt;atomic-format-number maximum-fraction-digits="2"&gt;&lt;/atomic-format-number&gt;<br>
        &lt;/atomic-product-numeric-field-value&gt;
      </div>
    </div>
  `,
  decorators: [
    productTemplateDecorator,
    commerceProductListDecorator,
    commerceInterfaceDecorator,
  ],
  play: initializeCommerceInterface,
};
