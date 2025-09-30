import {describe, expect, it, vi} from 'vitest';
import * as fetchItemContextModule from '@/src/components/common/item-list/fetch-item-context';
import {fetchResultContext} from './fetch-result-context';

vi.mock('@/src/components/common/item-list/fetch-item-context');

describe('result-template-controllers', () => {
  describe('#fetchResultContext', () => {
    it('should call fetchItemContext with element and atomic-result parent name', () => {
      const mockElement = document.createElement('div');
      const mockPromise = Promise.resolve({});
      vi.mocked(fetchItemContextModule.fetchItemContext).mockReturnValue(
        mockPromise
      );

      fetchResultContext(mockElement);

      expect(fetchItemContextModule.fetchItemContext).toHaveBeenCalledWith(
        mockElement,
        'atomic-result'
      );
    });

    it('should return promise from fetchItemContext', () => {
      const mockElement = document.createElement('div');
      const mockPromise = Promise.resolve({title: 'Test Result'});
      vi.mocked(fetchItemContextModule.fetchItemContext).mockReturnValue(
        mockPromise
      );

      const result = fetchResultContext(mockElement);

      expect(result).toBe(mockPromise);
    });
  });
});
