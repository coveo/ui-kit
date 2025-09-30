import type {InteractiveResult} from '@coveo/headless';
import type {LitElement} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {InteractiveItemContextController} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import {ItemContextController} from '@/src/components/common/item-list/context/item-context-controller';
import * as fetchItemContextModule from '@/src/components/common/item-list/fetch-item-context';
import {
  createInteractiveResultContextController,
  createResultContextController,
  fetchResultContext,
} from './result-template-controllers';

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

describe('result-template-controllers', () => {
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

  describe('#createResultContextController', () => {
    it('should create ItemContextController with atomic-result parent name and default folded false', () => {
      createResultContextController(mockHost);

      expect(ItemContextController).toHaveBeenCalledWith(mockHost, {
        parentName: 'atomic-result',
        folded: false,
      });
    });

    it('should create ItemContextController with atomic-result parent name and custom folded value', () => {
      createResultContextController(mockHost, {folded: true});

      expect(ItemContextController).toHaveBeenCalledWith(mockHost, {
        parentName: 'atomic-result',
        folded: true,
      });
    });

    it('should return ItemContextController instance', () => {
      const mockController = {} as ItemContextController;
      vi.mocked(ItemContextController).mockReturnValue(mockController);

      const result = createResultContextController(mockHost);

      expect(result).toBe(mockController);
    });
  });

  describe('#createInteractiveResultContextController', () => {
    it('should create InteractiveItemContextController with host', () => {
      const hostWithError = mockHost as LitElement & {error: Error};

      createInteractiveResultContextController(hostWithError);

      expect(InteractiveItemContextController).toHaveBeenCalledWith(
        hostWithError
      );
    });

    it('should return InteractiveItemContextController instance', () => {
      const mockController =
        {} as InteractiveItemContextController<InteractiveResult>;
      vi.mocked(InteractiveItemContextController).mockReturnValue(
        mockController
      );
      const hostWithError = mockHost as LitElement & {error: Error};

      const result = createInteractiveResultContextController(hostWithError);

      expect(result).toBe(mockController);
    });
  });

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
