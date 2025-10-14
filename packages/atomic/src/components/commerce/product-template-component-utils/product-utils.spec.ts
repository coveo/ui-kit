/** biome-ignore-all lint/suspicious/noTemplateCurlyInString: <> */
import {type Product, ProductTemplatesHelpers} from '@coveo/headless/commerce';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {readFromObject} from '@/src/utils/object-utils';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {FieldValueIsNaNError} from './error';
import {
  buildStringTemplateFromProduct,
  getStringValueFromProductOrNull,
  parseValue,
} from './product-utils';

vi.mock('@coveo/headless/commerce', {spy: true});
vi.mock('@/src/utils/object-utils', {spy: true});

describe('product-utils', () => {
  let mockProduct: Product;
  let mockBindings: CommerceBindings;

  beforeEach(async () => {
    mockProduct = buildFakeProduct({
      permanentid: 'test-product-123',
      ec_name: 'Test Product',
      ec_price: 99.99,
      additionalFields: {
        customField: 'custom value',
        numericField: 42,
        stringNumberField: '123.45',
      },
    });

    mockBindings = {
      engine: {
        logger: {warn: vi.fn()},
      } as never,
      i18n: await createTestI18n(),
      store: {} as never,
      interfaceElement: {} as never,
    };

    vi.spyOn(ProductTemplatesHelpers, 'getProductProperty').mockImplementation(
      () => null
    );

    vi.clearAllMocks();
  });

  describe('#parseValue', () => {
    it('should return parsed numeric value when field contains valid number', () => {
      vi.spyOn(ProductTemplatesHelpers, 'getProductProperty').mockReturnValue(
        '123.45'
      );

      const result = parseValue(mockProduct, 'price');

      expect(result).toBe(123.45);
      expect(ProductTemplatesHelpers.getProductProperty).toHaveBeenCalledWith(
        mockProduct,
        'price'
      );
    });

    it('should return parsed numeric value when field contains integer', () => {
      vi.spyOn(ProductTemplatesHelpers, 'getProductProperty').mockReturnValue(
        42
      );

      const result = parseValue(mockProduct, 'quantity');

      expect(result).toBe(42);
    });

    it('should return null when field value is null', () => {
      vi.spyOn(ProductTemplatesHelpers, 'getProductProperty').mockReturnValue(
        null
      );

      const result = parseValue(mockProduct, 'missingField');

      expect(result).toBeNull();
    });

    it('should throw FieldValueIsNaNError when field value cannot be parsed as number', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue(
        'not-a-number'
      );

      expect(() => parseValue(mockProduct, 'invalidField')).toThrow(
        FieldValueIsNaNError
      );
      expect(() => parseValue(mockProduct, 'invalidField')).toThrow(
        'Could not parse "not-a-number" from field "invalidField" as a number.'
      );
    });

    it('should throw FieldValueIsNaNError when field value is empty string', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue('');

      expect(() => parseValue(mockProduct, 'emptyField')).toThrow(
        FieldValueIsNaNError
      );
    });

    it('should handle boolean values that cannot be parsed', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue(
        true
      );

      expect(() => parseValue(mockProduct, 'booleanField')).toThrow(
        FieldValueIsNaNError
      );
    });

    it('should parse zero correctly', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue(0);

      const result = parseValue(mockProduct, 'zeroField');

      expect(result).toBe(0);
    });

    it('should parse negative numbers correctly', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue(
        '-15.5'
      );

      const result = parseValue(mockProduct, 'negativeField');

      expect(result).toBe(-15.5);
    });
  });

  describe('#getStringValueFromProductOrNull', () => {
    it('should return string value when field contains valid string', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue(
        'Valid String'
      );

      const result = getStringValueFromProductOrNull(mockProduct, 'name');

      expect(result).toBe('Valid String');
      expect(ProductTemplatesHelpers.getProductProperty).toHaveBeenCalledWith(
        mockProduct,
        'name'
      );
    });

    it('should return null when field value is not a string', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue(
        123
      );

      const result = getStringValueFromProductOrNull(mockProduct, 'price');

      expect(result).toBeNull();
    });

    it('should return null when field value is empty string', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue('');

      const result = getStringValueFromProductOrNull(mockProduct, 'emptyField');

      expect(result).toBeNull();
    });

    it('should return null when field value is whitespace only', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue(
        '   \t\n  '
      );

      const result = getStringValueFromProductOrNull(
        mockProduct,
        'whitespaceField'
      );

      expect(result).toBeNull();
    });

    it('should return null when field value is null', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue(
        null
      );

      const result = getStringValueFromProductOrNull(mockProduct, 'nullField');

      expect(result).toBeNull();
    });

    it('should return null when field value is undefined', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue(
        null
      );

      const result = getStringValueFromProductOrNull(
        mockProduct,
        'undefinedField'
      );

      expect(result).toBeNull();
    });

    it('should return null when field value is boolean', () => {
      vi.mocked(ProductTemplatesHelpers.getProductProperty).mockReturnValue(
        true
      );

      const result = getStringValueFromProductOrNull(
        mockProduct,
        'booleanField'
      );

      expect(result).toBeNull();
    });
  });

  describe('#buildStringTemplateFromProduct', () => {
    it('should replace template variables with product values', () => {
      vi.mocked(readFromObject)
        .mockReturnValueOnce('Test Product')
        .mockReturnValueOnce('99.99');

      const template = 'Product: ${ec_name}, Price: ${ec_price}';
      const result = buildStringTemplateFromProduct(
        template,
        mockProduct,
        mockBindings
      );

      expect(result).toBe('Product: Test Product, Price: 99.99');
      expect(vi.mocked(readFromObject)).toHaveBeenCalledWith(
        mockProduct,
        'ec_name'
      );
      expect(vi.mocked(readFromObject)).toHaveBeenCalledWith(
        mockProduct,
        'ec_price'
      );
    });

    it('should handle multiple occurrences of same variable', () => {
      vi.mocked(readFromObject).mockReturnValue('Test Product');

      const template = '${ec_name} - ${ec_name} (${ec_name})';
      const result = buildStringTemplateFromProduct(
        template,
        mockProduct,
        mockBindings
      );

      expect(result).toBe('Test Product - Test Product (Test Product)');
      expect(vi.mocked(readFromObject)).toHaveBeenCalledTimes(3);
    });

    it('should fallback to window object when product property is not found', () => {
      vi.stubGlobal('$location', {hostname: 'example.com'});

      vi.mocked(readFromObject)
        .mockReturnValueOnce(undefined)
        .mockReturnValueOnce('example.com');

      const template = 'Host: ${location.hostname}';
      const result = buildStringTemplateFromProduct(
        template,
        mockProduct,
        mockBindings
      );

      expect(result).toBe('Host: example.com');
      expect(vi.mocked(readFromObject)).toHaveBeenCalledWith(
        mockProduct,
        'location.hostname'
      );
      expect(vi.mocked(readFromObject)).toHaveBeenCalledWith(
        window,
        'location.hostname'
      );

      vi.unstubAllGlobals();
    });

    it('should log warning and return empty string when variable cannot be resolved', () => {
      vi.mocked(readFromObject).mockReturnValue(undefined);

      const template = 'Unknown: ${unknown.field}';
      const result = buildStringTemplateFromProduct(
        template,
        mockProduct,
        mockBindings
      );

      expect(result).toBe('Unknown: ');
      expect(mockBindings.engine.logger.warn).toHaveBeenCalledWith(
        'unknown.field used in the href template is undefined for this product: test-product-123 and could not be found in the window object.'
      );
    });

    it('should handle nested object properties', () => {
      vi.mocked(readFromObject).mockReturnValue('nested-value');

      const template = 'Nested: ${additionalFields.customField}';
      const result = buildStringTemplateFromProduct(
        template,
        mockProduct,
        mockBindings
      );

      expect(result).toBe('Nested: nested-value');
      expect(vi.mocked(readFromObject)).toHaveBeenCalledWith(
        mockProduct,
        'additionalFields.customField'
      );
    });
  });
});
