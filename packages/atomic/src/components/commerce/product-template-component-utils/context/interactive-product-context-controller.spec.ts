import type {InteractiveProduct} from '@coveo/headless/commerce';
import type {LitElement} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {InteractiveItemContextController} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import {createInteractiveProductContextController} from './interactive-product-context-controller';

vi.mock(
  '@/src/components/common/item-list/context/interactive-item-context-controller',
  {spy: true}
);

describe('product-template-controllers', () => {
  let mockHost: LitElement & {error: Error | null};

  beforeEach(() => {
    vi.mocked(InteractiveItemContextController).mockImplementation(function (
      this: unknown
    ) {
      return this;
    });
    mockHost = {
      addController: vi.fn(),
      requestUpdate: vi.fn(),
      dispatchEvent: vi.fn(),
      error: null,
    } as unknown as LitElement & {error: Error | null};
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
      const mockController =
        {} as InteractiveItemContextController<InteractiveProduct>;
      vi.mocked(InteractiveItemContextController).mockImplementation(function (
        this: unknown
      ) {
        return mockController;
      });
      const hostWithError = mockHost as LitElement & {error: Error};

      const result = createInteractiveProductContextController(hostWithError);

      expect(result).toBe(mockController);
    });
  });
});
