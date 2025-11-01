import type {LitElement} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  ItemContextController,
  MissingParentError,
} from '@/src/components/common/item-list/context/item-context-controller';
import {createProductContextController} from './product-context-controller';

vi.mock('@/src/components/common/item-list/context/item-context-controller', {
  spy: true,
});

describe('product-template-controllers', () => {
  let mockHost: LitElement & {error: Error | null};

  beforeEach(() => {
    vi.mocked(ItemContextController).mockImplementation(function (
      this: unknown
    ) {
      return this;
    });
    vi.mocked(MissingParentError).mockImplementation(function (
      this: unknown,
      elementName,
      parentName
    ) {
      const error = new Error(
        `The "${elementName}" element must be the child of an "${parentName}" element.`
      );
      error.name = 'MissingParentError';
      return error;
    });
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
      const result = createProductContextController(mockHost);

      expect(result).toBe(vi.mocked(ItemContextController).mock.instances[0]);
    });
  });
});
