import type {InteractiveResult} from '@coveo/headless';
import type {LitElement} from 'lit';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {InteractiveItemContextController} from '@/src/components/common/item-list/context/interactive-item-context-controller';
import {createInteractiveResultContextController} from './interactive-result-context-controller';

vi.mock(
  '@/src/components/common/item-list/context/interactive-item-context-controller',
  () => ({
    InteractiveItemContextController: vi.fn().mockImplementation(() => ({})),
  })
);

describe('result-template-controllers', () => {
  let mockHost: LitElement & {error: Error | null};

  beforeEach(() => {
    mockHost = {
      addController: vi.fn(),
      requestUpdate: vi.fn(),
      dispatchEvent: vi.fn(),
      error: null,
    } as unknown as LitElement & {error: Error | null};
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
});
