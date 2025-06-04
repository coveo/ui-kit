import {Product} from '@coveo/headless/commerce';
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  MockInstance,
} from 'vitest';
import {
  InteractiveItemContext,
  ItemContext,
  itemContext,
  MissingParentError,
} from '../../common/item-list/item-decorators';
import {
  ProductContext,
  InteractiveProductContext,
  productContext,
  ProductContextEvent,
  InteractiveProductContextEvent,
} from './product-template-decorators';

// Mock the item-decorators module
vi.mock('../../common/item-list/item-decorators', () => ({
  ItemContext: vi.fn(),
  InteractiveItemContext: vi.fn(),
  itemContext: vi.fn(),
  MissingParentError: vi.fn().mockImplementation(function (
    this: MissingParentError,
    elementName: string,
    parentName: string
  ) {
    this.message = `The "${elementName}" element must be the child of an "${parentName}" element.`;
    this.name = 'MissingParentError';
  }),
}));

describe('product-template-decorators', () => {
  let consoleErrorSpy: MockInstance;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('#ProductContext', () => {
    it('should call ItemContext with default parameters when called without options', () => {
      const mockItemContext = vi.fn();
      vi.mocked(ItemContext).mockReturnValue(mockItemContext);

      const result = ProductContext();

      expect(ItemContext).toHaveBeenCalledWith({
        parentName: 'atomic-product',
        folded: false,
      });
      expect(result).toBe(mockItemContext);
    });

    it('should call ItemContext with folded: false when explicitly set', () => {
      const mockItemContext = vi.fn();
      vi.mocked(ItemContext).mockReturnValue(mockItemContext);

      const result = ProductContext({folded: false});

      expect(ItemContext).toHaveBeenCalledWith({
        parentName: 'atomic-product',
        folded: false,
      });
      expect(result).toBe(mockItemContext);
    });

    it('should call ItemContext with folded: true when explicitly set', () => {
      const mockItemContext = vi.fn();
      vi.mocked(ItemContext).mockReturnValue(mockItemContext);

      const result = ProductContext({folded: true});

      expect(ItemContext).toHaveBeenCalledWith({
        parentName: 'atomic-product',
        folded: true,
      });
      expect(result).toBe(mockItemContext);
    });
  });

  describe('#InteractiveProductContext', () => {
    it('should call InteractiveItemContext without parameters', () => {
      const mockInteractiveItemContext = vi.fn();
      vi.mocked(InteractiveItemContext).mockReturnValue(
        mockInteractiveItemContext
      );

      const result = InteractiveProductContext();

      expect(InteractiveItemContext).toHaveBeenCalledWith();
      expect(result).toBe(mockInteractiveItemContext);
    });
  });

  describe('#productContext', () => {
    it('should call itemContext with the element and atomic-product parent name', () => {
      const mockElement = document.createElement('div');
      const mockPromise = Promise.resolve({} as Product);
      vi.mocked(itemContext).mockReturnValue(mockPromise);

      const result = productContext(mockElement);

      expect(itemContext).toHaveBeenCalledWith(mockElement, 'atomic-product');
      expect(result).toBe(mockPromise);
    });

    it('should return a promise that resolves to a Product', async () => {
      const mockElement = document.createElement('div');
      const mockProduct = {
        permanentid: 'test-product-id',
        clickUri: 'https://example.com/product',
        ec_name: 'Test Product',
      } as Product;
      vi.mocked(itemContext).mockResolvedValue(mockProduct);

      const result = await productContext(mockElement);

      expect(result).toBe(mockProduct);
    });

    it('should return a promise that rejects with MissingParentError when element is not child of atomic-product', async () => {
      const mockElement = document.createElement('div');
      const mockError = new MissingParentError('div', 'atomic-product');
      vi.mocked(itemContext).mockRejectedValue(mockError);

      await expect(productContext(mockElement)).rejects.toBe(mockError);
    });

    it('should support generic typing', () => {
      const mockElement = document.createElement('div');
      interface ExtendedProduct extends Product {
        customField: string;
      }
      const mockPromise = Promise.resolve({} as ExtendedProduct);
      vi.mocked(itemContext).mockReturnValue(mockPromise);

      const result = productContext<ExtendedProduct>(mockElement);

      expect(itemContext).toHaveBeenCalledWith(mockElement, 'atomic-product');
      expect(result).toBe(mockPromise);
    });
  });

  describe('Type exports', () => {
    it('should export ProductContextEvent type', () => {
      // Type test - ensures ProductContextEvent is properly exported
      const handler = (product: Product) => {
        expect(product).toBeDefined();
      };
      const event: ProductContextEvent = new CustomEvent('test', {
        detail: handler,
      });
      expect(event).toBeDefined();
    });

    it('should export InteractiveProductContextEvent type', () => {
      // Type test - ensures InteractiveProductContextEvent is properly exported
      const handler = (interactiveItem: unknown) => {
        expect(interactiveItem).toBeDefined();
      };
      const event: InteractiveProductContextEvent = new CustomEvent('test', {
        detail: handler,
      });
      expect(event).toBeDefined();
    });

    it('should support generic ProductContextEvent with custom Product type', () => {
      interface CustomProduct extends Product {
        customField: string;
      }
      const handler = (product: CustomProduct) => {
        expect(product.customField).toBeDefined();
      };
      const event: ProductContextEvent<CustomProduct> = new CustomEvent(
        'test',
        {detail: handler}
      );
      expect(event).toBeDefined();
    });
  });
});
