import type {Product} from '@coveo/headless/commerce';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicProductNumericFieldValue} from './atomic-product-numeric-field-value';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-product-numeric-field-value', () => {
  let i18n: i18n;
  let mockProduct: Product;

  beforeEach(async () => {
    console.error = vi.fn();

    i18n = await createTestI18n();

    mockProduct = buildFakeProduct({
      ec_rating: 4.5,
      ec_price: 29.99,
      additionalFields: {
        custom_numeric_field: 12345,
        non_numeric_field: 'not a number',
        zero_field: 0,
        null_field: null,
      },
    });
  });

  const renderComponent = async (
    options: {
      field?: string;
      product?: Product | null;
    } = {}
  ) => {
    const productToUse = 'product' in options ? options.product : mockProduct;
    const {element, atomicInterface} =
      await renderInAtomicProduct<AtomicProductNumericFieldValue>({
        template: html`<atomic-product-numeric-field-value
          field=${ifDefined(options.field)}
        ></atomic-product-numeric-field-value>`,
        selector: 'atomic-product-numeric-field-value',
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
    const el = document.createElement('atomic-product-numeric-field-value');
    expect(el).toBeInstanceOf(AtomicProductNumericFieldValue);
  });

  it('should render nothing when no field is provided', async () => {
    const element = await renderComponent();
    expect(element).toBeDefined();
    expect(element.textContent?.trim()).toBe('');
  });

  describe('when field has numeric value', () => {
    it('should render the #field value from product properties', async () => {
      const element = await renderComponent({field: 'ec_rating'});
      expect(element.textContent?.trim()).toBe('4.5');
    });

    it('should render the #field value from additionalFields', async () => {
      const element = await renderComponent({field: 'custom_numeric_field'});
      expect(element.textContent?.trim()).toBe('12,345');
    });

    it('should render zero values correctly', async () => {
      const element = await renderComponent({field: 'zero_field'});
      expect(element.textContent?.trim()).toBe('0');
    });
  });

  describe('when field has non-numeric value', () => {
    it('should handle null values', async () => {
      const element = await renderComponent({field: 'null_field'});
      expect(element.textContent?.trim()).toBe('');
    });

    it('should handle non-numeric string values', async () => {
      const element = await renderComponent({field: 'non_numeric_field'});
      expect(element.textContent?.trim()).toBe('');
    });

    it('should handle non-existent fields', async () => {
      const element = await renderComponent({field: 'nonexistent_field'});
      expect(element.textContent?.trim()).toBe('');
    });
  });

  describe('when product is not available', () => {
    it('should render error component when #product is null', async () => {
      const element = await renderComponent({
        product: null as unknown as Product,
      });

      const errorComponent = element?.querySelector('atomic-component-error');
      expect(errorComponent).toBeDefined();
    });

    it('should render error component when #product is undefined', async () => {
      const element = await renderComponent({
        product: undefined as unknown as Product,
      });

      const errorComponent = element?.querySelector('atomic-component-error');
      expect(errorComponent).toBeDefined();
    });
  });

  describe('number formatting', () => {
    it('should handle custom number format events', async () => {
      const element = await renderComponent({field: 'ec_rating'});

      const customFormatter = (value: number) => `Custom: ${value}`;
      const event = new CustomEvent('atomic/numberFormat', {
        detail: customFormatter,
      });

      element.dispatchEvent(event);
      await element.updateComplete;

      expect(element.textContent?.trim()).toBe('Custom: 4.5');
    });

    it('should handle formatter errors gracefully', async () => {
      const element = await renderComponent({field: 'ec_rating'});

      const errorFormatter = () => {
        throw new Error('Formatting error');
      };
      const event = new CustomEvent('atomic/numberFormat', {
        detail: errorFormatter,
      });

      element.dispatchEvent(event);
      await element.updateComplete;

      // Should fallback to toString
      expect(element.textContent?.trim()).toBe('4.5');
    });
  });

  describe('property updates', () => {
    it('should handle #field property changes', async () => {
      const element = await renderComponent({field: 'ec_rating'});

      element.field = 'ec_price';
      await element.updateComplete;

      expect(element.field).toBe('ec_price');
      expect(element.textContent?.trim()).toBe('29.99');
    });

    it('should handle #product property changes', async () => {
      const element = await renderComponent({field: 'ec_rating'});

      const newProduct = buildFakeProduct({
        ec_rating: 3.5,
      });

      // @ts-expect-error private property access for testing
      element.product = newProduct;
      await element.updateComplete;

      expect(element.textContent?.trim()).toBe('3.5');
    });
  });

  it('should work with different interface types', async () => {
    const {element} = await renderInAtomicProduct<AtomicProductNumericFieldValue>({
      template: html`<atomic-product-numeric-field-value
        .field=${'ec_rating'}
      ></atomic-product-numeric-field-value>`,
      selector: 'atomic-product-numeric-field-value',
      product: mockProduct,
      bindings: (bindings) => {
        bindings.interfaceElement.type = 'search';
        bindings.i18n = i18n;
        return bindings;
      },
    });

    expect(element).toBeDefined();
    expect(element?.field).toBe('ec_rating');
  });
});