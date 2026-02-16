import {beforeEach, describe, expect, it, vi} from 'vitest';
import * as fetchItemContextModule from '@/src/components/common/item-list/fetch-item-context';
import {fetchProductContext} from './fetch-product-context';

vi.mock('@/src/components/common/item-list/fetch-item-context', {spy: true});

describe('product-template-controllers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
