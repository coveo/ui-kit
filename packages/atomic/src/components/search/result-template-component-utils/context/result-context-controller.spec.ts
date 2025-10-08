import type {LitElement} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ItemContextController} from '@/src/components/common/item-list/context/item-context-controller';
import {createResultContextController} from './result-context-controller';

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

describe('result-context-controller', () => {
  let mockHost: LitElement & {error: Error | null};

  beforeEach(() => {
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
});
