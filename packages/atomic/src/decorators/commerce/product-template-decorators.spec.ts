import {LitElement} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {InteractiveItemContextController} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import {ItemContextController} from '@/src/components/common/item-list/context/item-context-controller';
import * as fetchItemContextModule from '@/src/components/common/item-list/fetch-item-context';
import {
  createInteractiveProductContextController,
  createProductContextController,
  fetchProductContext,
} from './product-template-decorators';

vi.mock('@/src/components/common/item-list/fetch-item-context');
vi.mock(
  '@/src/components/common/item-list/context/item-context-controller',
  () => ({
    ItemContextController: vi.fn().mockImplementation(() => ({})),
    MissingParentError: vi
      .fn()
      .mockImplementation((elementName, parentName) => {
        const error = new Error(
          `The "${elementName}" element must be the child of an "${parentName}" element.`
        );
        error.name = 'MissingParentError';
        return error;
      }),
  })
);
vi.mock(
  '@/src/components/common/item-list/context/interactive-item-context-controller',
  () => ({
    InteractiveItemContextController: vi.fn().mockImplementation(() => ({})),
  })
);

describe('product-template-decorators', () => {
  let mockHost: LitElement & {error: Error | null};

  beforeEach(() => {
    vi.clearAllMocks();
    mockHost = {
      addController: vi.fn(),
      requestUpdate: vi.fn(),
      dispatchEvent: vi.fn(),
      error: null,
    } as unknown as LitElement & {error: Error | null};
  });

  describe('#createProductContextController', () => {
    it('should create ItemContextController with atomic-product parent name and default folded false', () => {
      createProductContextController(mockHost);

      expect(ItemContextController).toHaveBeenCalledWith(mockHost, {
        parentName: 'atomic-product',
        folded: false,
      });
    });

    it('should create ItemContextController with atomic-product parent name and custom folded value', () => {
      createProductContextController(mockHost, {folded: true});

      expect(ItemContextController).toHaveBeenCalledWith(mockHost, {
        parentName: 'atomic-product',
        folded: true,
      });
    });

    it('should return ItemContextController instance', () => {
      const mockController = {} as ItemContextController;
      vi.mocked(ItemContextController).mockReturnValue(mockController);

      const result = createProductContextController(mockHost);

      expect(result).toBe(mockController);
    });
  });

  describe('#createInteractiveProductContextController', () => {
    it('should create InteractiveItemContextController with host', () => {
      const hostWithError = mockHost as LitElement & {error: Error};

      createInteractiveProductContextController(hostWithError);

      expect(InteractiveItemContextController).toHaveBeenCalledWith(
        hostWithError
      );
    });

    it('should return InteractiveItemContextController instance', () => {
      const mockController = {} as InteractiveItemContextController;
      vi.mocked(InteractiveItemContextController).mockReturnValue(
        mockController
      );
      const hostWithError = mockHost as LitElement & {error: Error};

      const result = createInteractiveProductContextController(hostWithError);

      expect(result).toBe(mockController);
    });
  });

  describe('#fetchProductContext', () => {
    it('should call fetchItemContext with element and atomic-product parent name', () => {
      const mockElement = document.createElement('div');
      const mockPromise = Promise.resolve({});
      vi.mocked(fetchItemContextModule.fetchItemContext).mockReturnValue(
        mockPromise
      );

      fetchProductContext(mockElement);

      expect(fetchItemContextModule.fetchItemContext).toHaveBeenCalledWith(
        mockElement,
        'atomic-product'
      );
    });

    it('should return promise from fetchItemContext', () => {
      const mockElement = document.createElement('div');
      const mockPromise = Promise.resolve({title: 'Test Product'});
      vi.mocked(fetchItemContextModule.fetchItemContext).mockReturnValue(
        mockPromise
      );

      const result = fetchProductContext(mockElement);

      expect(result).toBe(mockPromise);
    });
  });
});
