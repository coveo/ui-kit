import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {Product} from '@coveo/headless/commerce';
import {i18n} from 'i18next';
import {html} from 'lit';
import {describe, it, vi, expect, beforeEach} from 'vitest';
import {AtomicProductText} from './atomic-product-text';

// Mock headless at the top level
vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-product-text', () => {
  let i18n: i18n;
  let mockProduct: Product;

  const locators = {
    getCommerceText: (element: AtomicProductText) =>
      element.shadowRoot?.querySelector('atomic-commerce-text'),
  };

  beforeEach(async () => {
    console.error = vi.fn();

    i18n = await createTestI18n();
    i18n.addResourceBundle(
      'en',
      'translation',
      {
        'no-field-value': 'No value for field',
        'default-text': 'Default text content',
      },
      true
    );

    mockProduct = buildFakeProduct({
      ec_name: 'Test Product Name',
      ec_description: 'Test Product Description',
      ec_brand: 'Test Brand',
      additionalFields: {
        custom_field: 'Custom Field Value',
        empty_field: '',
        null_field: null,
      },
    });
  });

  const renderComponent = async (
    options: {
      field?: string;
      shouldHighlight?: boolean;
      default?: string;
      product?: Product | null;
    } = {}
  ) => {
    const productToUse = 'product' in options ? options.product : mockProduct;
    const {element, atomicInterface} =
      await renderInAtomicProduct<AtomicProductText>({
        template: html`<atomic-product-text
          .field=${options.field || 'ec_name'}
          .shouldHighlight=${options.shouldHighlight ?? true}
          .default=${options.default || ''}
        ></atomic-product-text>`,
        selector: 'atomic-product-text',
        product: productToUse === null ? undefined : productToUse,
        bindings: (bindings) => {
          bindings.interfaceElement.type = 'product-listing';
          bindings.i18n = i18n;
          bindings.store = {
            ...bindings.store,
            onChange: vi.fn(),
            state: {
              ...bindings.store?.state,
              loadingFlags: [],
            },
          };
          return bindings;
        },
      });

    await atomicInterface.updateComplete;
    await element?.updateComplete;

    return element;
  };

  it('should be defined', () => {
    const el = document.createElement('atomic-product-text');
    expect(el).toBeInstanceOf(AtomicProductText);
  });

  it('should render with default props', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
    expect(element.field).toBe('ec_name');
    expect(element.shouldHighlight).toBe(true);
    expect(element.default).toBe('');
  });

  describe('when field has value', () => {
    it('should render the #field value from product properties', async () => {
      const element = await renderComponent({field: 'ec_name'});

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
      expect(commerceText?.shadowRoot?.textContent).toContain(
        'Test Product Name'
      );
    });

    it('should render the #field value from additionalFields', async () => {
      const element = await renderComponent({field: 'custom_field'});

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
      expect(commerceText?.shadowRoot?.textContent).toContain(
        'Custom Field Value'
      );
    });

    it('should render #ec_description field correctly', async () => {
      const element = await renderComponent({field: 'ec_description'});

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
      expect(commerceText?.shadowRoot?.textContent).toContain(
        'Test Product Description'
      );
    });

    it('should render #ec_brand field correctly', async () => {
      const element = await renderComponent({field: 'ec_brand'});

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
      expect(commerceText?.shadowRoot?.textContent).toContain('Test Brand');
    });
  });

  describe('when field has no value', () => {
    it('should render default value when #field is empty string', async () => {
      const element = await renderComponent({
        field: 'empty_field',
        default: 'default-text',
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();

      expect(commerceText?.shadowRoot?.textContent).toContain(
        'Default text content'
      );
    });

    it('should render default value when #field is null', async () => {
      const element = await renderComponent({
        field: 'null_field',
        default: 'default-text',
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
      expect(commerceText?.shadowRoot?.textContent).toContain(
        'Default text content'
      );
    });

    it('should render default value when #field does not exist', async () => {
      const element = await renderComponent({
        field: 'nonexistent_field',
        default: 'default-text',
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
      expect(commerceText?.shadowRoot?.textContent).toContain(
        'Default text content'
      );
    });

    it('should render empty when no #default is provided', async () => {
      const element = await renderComponent({
        field: 'nonexistent_field',
        default: '',
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
    });
  });

  describe('when product is not available', () => {
    it('should render nothing when #product is null', async () => {
      const element = await renderComponent({
        product: null as unknown as Product,
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeNull();
    });

    it('should render nothing when #product is undefined', async () => {
      const element = await renderComponent({
        product: undefined as unknown as Product,
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeNull();
    });
  });

  describe('property updates', () => {
    it('should handle #field property changes', async () => {
      const element = await renderComponent({field: 'ec_name'});

      element.field = 'ec_brand';
      await element.updateComplete;

      expect(element.field).toBe('ec_brand');
      const commerceText = locators.getCommerceText(element);
      expect(commerceText?.shadowRoot?.textContent).toContain('Test Brand');
    });

    it('should handle #shouldHighlight property changes', async () => {
      const element = await renderComponent({shouldHighlight: true});

      element.shouldHighlight = false;
      await element.updateComplete;

      expect(element.shouldHighlight).toBe(false);
    });

    it('should handle #default property changes', async () => {
      const element = await renderComponent({
        field: 'nonexistent_field',
        default: 'original-default',
      });

      element.default = 'new-default';
      await element.updateComplete;

      expect(element.default).toBe('new-default');
    });

    it('should handle #product property changes', async () => {
      const element = await renderComponent({field: 'ec_name'});

      const newProduct = buildFakeProduct({
        ec_name: 'New Product Name',
      });

      element.product = newProduct;
      await element.updateComplete;

      const commerceText = locators.getCommerceText(element);
      expect(commerceText?.shadowRoot?.textContent).toContain(
        'New Product Name'
      );
    });
  });

  describe('edge cases', () => {
    it('should display nothing for numeric #field values', async () => {
      const productWithNumericField = buildFakeProduct({
        additionalFields: {
          numeric_field: 12345,
        },
      });
      const element = await renderComponent({
        field: 'numeric_field',
        product: productWithNumericField,
      });
      const commerceText = locators.getCommerceText(element);
      expect(commerceText?.shadowRoot?.textContent).toBe('');
    });

    it('should display nothing for boolean #field values', async () => {
      const productWithBooleanField = buildFakeProduct({
        additionalFields: {
          boolean_field: true,
        },
      });
      const element = await renderComponent({
        field: 'boolean_field',
        product: productWithBooleanField,
      });
      const commerceText = locators.getCommerceText(element);
      expect(commerceText?.shadowRoot?.textContent).toBe('');
    });

    it('should handle special characters in #field values', async () => {
      const productWithSpecialChars = buildFakeProduct({
        additionalFields: {
          special_field: 'Value with éàü & symbols!',
        },
      });

      const element = await renderComponent({
        field: 'special_field',
        product: productWithSpecialChars,
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText?.shadowRoot?.textContent).toContain(
        'Value with éàü & symbols!'
      );
    });
  });

  describe('different interface types', () => {
    it('should work with search interface type', async () => {
      const {element} = await renderInAtomicProduct<AtomicProductText>({
        template: html`<atomic-product-text
          .field=${'ec_name'}
        ></atomic-product-text>`,
        selector: 'atomic-product-text',
        product: mockProduct,
        bindings: (bindings) => {
          bindings.interfaceElement.type = 'search';
          bindings.i18n = i18n;
          return bindings;
        },
      });

      expect(element).toBeDefined();
      expect(element?.field).toBe('ec_name');
    });

    it('should work with product-listing interface type', async () => {
      const {element} = await renderInAtomicProduct<AtomicProductText>({
        template: html`<atomic-product-text
          .field=${'ec_name'}
        ></atomic-product-text>`,
        selector: 'atomic-product-text',
        product: mockProduct,
        bindings: (bindings) => {
          bindings.interfaceElement.type = 'product-listing';
          bindings.i18n = i18n;
          return bindings;
        },
      });

      expect(element).toBeDefined();
      expect(element?.field).toBe('ec_name');
    });
  });
});
