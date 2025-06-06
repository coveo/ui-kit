import * as interactiveItemContextModule from '@/src/decorators/item-list/interactive-item-context';
import * as itemContextModule from '@/src/decorators/item-list/item-context';
import {describe, it, expect, vi} from 'vitest';
import * as fetchItemContextModule from '../../common/item-list/fetch-item-context';
import {
  productContext,
  interactiveProductContext,
  fetchProductContext,
} from './product-template-decorators';

vi.mock('@/src/decorators/item-list/item-context');
vi.mock('@/src/decorators/item-list/interactive-item-context');
vi.mock('../../common/item-list/item-context');
vi.mock('../../common/item-list/fetch-item-context');

describe('product-template-decorators', () => {
  describe('#ProductContext', () => {
    it('should call ItemContext with atomic-product parent name and default folded false', () => {
      const mockItemContext = vi.fn();
      vi.mocked(itemContextModule.itemContext).mockReturnValue(mockItemContext);

      productContext();

      expect(itemContextModule.itemContext).toHaveBeenCalledWith({
        parentName: 'atomic-product',
        folded: false,
      });
    });

    it('should call ItemContext with atomic-product parent name and custom folded value', () => {
      const mockItemContext = vi.fn();
      vi.mocked(itemContextModule.itemContext).mockReturnValue(mockItemContext);

      productContext({folded: true});

      expect(itemContextModule.itemContext).toHaveBeenCalledWith({
        parentName: 'atomic-product',
        folded: true,
      });
    });
  });

  describe('#InteractiveProductContext', () => {
    it('should call InteractiveItemContext with no arguments', () => {
      const mockInteractiveItemContext = vi.fn();
      vi.mocked(
        interactiveItemContextModule.interactiveItemContext
      ).mockReturnValue(mockInteractiveItemContext);

      interactiveProductContext();

      expect(
        interactiveItemContextModule.interactiveItemContext
      ).toHaveBeenCalledWith();
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
  });
});
