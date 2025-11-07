import type {Product} from '@coveo/headless/commerce';
import type {i18n} from 'i18next';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {AtomicProductText} from './atomic-product-text';
import './atomic-product-text';

vi.mock('@coveo/headless/commerce', {spy: true});

describe('atomic-product-text', () => {
  let i18n: i18n;
  let mockProduct: Product;

  const locators = {
    getCommerceText: (element: AtomicProductText) =>
      element?.querySelector('atomic-commerce-text'),
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
          field=${ifDefined(options.field)}
          should-highlight=${ifDefined(options.shouldHighlight)}
          default=${ifDefined(options.default)}
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

  it('should be defined', async () => {
    const el = await renderComponent();
    expect(el).toBeInstanceOf(AtomicProductText);
  });

  it('should render nothing when default props are used', async () => {
    const element = await renderComponent();
    const commerceText = locators.getCommerceText(element);
    expect(element).toBeDefined();
    expect(commerceText).toBeNull();
    expect(element.textContent?.trim()).toBe('');
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

    it('should render nothing when no #default is provided', async () => {
      const element = await renderComponent({
        field: 'nonexistent_field',
        default: '',
      });

      const commerceText = locators.getCommerceText(element);

      expect(commerceText).toBeNull();
      expect(element).toBeDefined();
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

      // @ts-expect-error private property access for testing
      element.product = newProduct;
      await element.updateComplete;

      const commerceText = locators.getCommerceText(element);
      expect(commerceText?.shadowRoot?.textContent).toContain(
        'New Product Name'
      );
    });
  });

  describe('when #shouldHighlight is true', () => {
    it('should render highlights for #ec_name field with highlight keywords', async () => {
      const productWithHighlights = buildFakeProduct({
        ec_name: 'Test Product Name',
        nameHighlights: [
          {
            offset: 5,
            length: 7,
          },
        ],
      });

      const element = await renderComponent({
        field: 'ec_name',
        shouldHighlight: true,
        product: productWithHighlights,
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeNull();

      expect(element.innerHTML).not.toContain('<atomic-commerce-text');
    });

    it('should render highlights for #excerpt field with highlight keywords', async () => {
      const productWithExcerptHighlights = buildFakeProduct({
        excerpt: 'This is an excerpt with highlights',
        excerptHighlights: [
          {
            offset: 8,
            length: 2,
          },
        ],
      });

      const element = await renderComponent({
        field: 'excerpt',
        shouldHighlight: true,
        product: productWithExcerptHighlights,
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeNull();

      expect(element.innerHTML).not.toContain('<atomic-commerce-text');
    });

    it('should render plain text when #field is not supported for highlighting', async () => {
      const element = await renderComponent({
        field: 'ec_brand',
        shouldHighlight: true,
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
      expect(commerceText?.shadowRoot?.textContent).toContain('Test Brand');
    });

    it('should render plain text when no highlight keywords are available', async () => {
      const productWithoutHighlights = buildFakeProduct({
        ec_name: 'Test Product Name',
        nameHighlights: [],
      });

      const element = await renderComponent({
        field: 'ec_name',
        shouldHighlight: true,
        product: productWithoutHighlights,
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
      expect(commerceText?.shadowRoot?.textContent).toContain(
        'Test Product Name'
      );
    });

    it('should render plain text when highlight keywords are null', async () => {
      const productWithNullHighlights = buildFakeProduct({
        ec_name: 'Test Product Name',
        nameHighlights: null as unknown as [],
      });

      const element = await renderComponent({
        field: 'ec_name',
        shouldHighlight: true,
        product: productWithNullHighlights,
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
      expect(commerceText?.shadowRoot?.textContent).toContain(
        'Test Product Name'
      );
    });

    describe('when #shouldHighlight is false', () => {
      beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
      });

      it('should render plain text even for supported highlight fields', async () => {
        const productWithHighlights = buildFakeProduct({
          ec_name: 'Test Product Name',
          nameHighlights: [
            {
              offset: 5,
              length: 7,
            },
          ],
        });

        const element = await renderComponent({
          field: 'ec_name',
          shouldHighlight: false,
          product: productWithHighlights,
        });

        const commerceText = locators.getCommerceText(element);
        expect(commerceText).toBeDefined();
        expect(commerceText?.shadowRoot?.textContent).toContain(
          'Test Product Name'
        );
      });

      it('should render plain text for #excerpt field', async () => {
        const productWithExcerptHighlights = buildFakeProduct({
          excerpt: 'This is an excerpt with highlights',
          excerptHighlights: [
            {
              offset: 8,
              length: 2,
            },
          ],
        });

        const element = await renderComponent({
          field: 'excerpt',
          shouldHighlight: false,
          product: productWithExcerptHighlights,
        });

        const commerceText = locators.getCommerceText(element);
        expect(commerceText).toBeDefined();
        expect(commerceText?.shadowRoot?.textContent).toContain(
          'This is an excerpt with highlights'
        );
      });
    });

    it('should support highlighting for #ec_name field', async () => {
      const element = await renderComponent({
        field: 'ec_name',
        shouldHighlight: true,
      });

      expect(element.shouldHighlight).toBe(true);
    });

    it('should support highlighting for #excerpt field', async () => {
      const element = await renderComponent({
        field: 'excerpt',
        shouldHighlight: true,
      });

      expect(element.shouldHighlight).toBe(true);
    });

    it('should not support highlighting for other fields', async () => {
      const element = await renderComponent({
        field: 'ec_brand',
        shouldHighlight: true,
      });

      const commerceText = locators.getCommerceText(element);
      expect(commerceText).toBeDefined();
    });

    it('should handle errors gracefully when highlighting fails', async () => {
      const productWithHighlights = buildFakeProduct({
        ec_name: 'Test Product Name',
        nameHighlights: [
          {
            offset: 5,
            length: 7,
          },
        ],
      });

      const element = await renderComponent({
        field: 'ec_name',
        shouldHighlight: true,
        product: productWithHighlights,
      });

      expect(element).toBeDefined();
      expect(element.shadowRoot).toBeDefined();
    });
  });

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

    expect(element).toBeDefined();
    expect(commerceText).toBeNull();
    expect(element.textContent?.trim()).toBe('');
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

    expect(element).toBeDefined();
    expect(commerceText).toBeNull();
    expect(element.textContent?.trim()).toBe('');
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

  it('should work with `search` interface type', async () => {
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

  it('should work with `product-listing interface type', async () => {
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
