import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createAccessTokenManager} from './access-token-manager.js';

describe('AccessTokenManager', () => {
  let tokenManager: ReturnType<typeof createAccessTokenManager>;
  const initialToken = 'initial-token';

  beforeEach(() => {
    vi.clearAllMocks();
    tokenManager = createAccessTokenManager(initialToken);
  });

  it('should return the initial token', () => {
    expect(tokenManager.getAccessToken()).toBe(initialToken);
  });

  describe('when callback is registered BEFORE #setAccessToken', () => {
    it('should immediately notify the callback when token is updated', () => {
      const mockCallback = vi.fn();
      tokenManager.registerCallback(mockCallback);

      tokenManager.setAccessToken('new-token');

      expect(mockCallback).toHaveBeenCalledExactlyOnceWith('new-token');
      expect(tokenManager.getAccessToken()).toBe('new-token');
    });

    it('should not invoke callback if no token was previously set', () => {
      const mockCallback = vi.fn();

      tokenManager.registerCallback(mockCallback);

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should handle multiple token updates correctly', () => {
      const mockCallback = vi.fn();
      tokenManager.registerCallback(mockCallback);

      tokenManager.setAccessToken('token-1');
      tokenManager.setAccessToken('token-2');
      tokenManager.setAccessToken('token-3');

      expect(mockCallback).toHaveBeenCalledTimes(3);
      expect(mockCallback).toHaveBeenNthCalledWith(1, 'token-1');
      expect(mockCallback).toHaveBeenNthCalledWith(2, 'token-2');
      expect(mockCallback).toHaveBeenNthCalledWith(3, 'token-3');
      expect(tokenManager.getAccessToken()).toBe('token-3');
    });
  });

  describe('when callback is registered AFTER #setAccessToken', () => {
    it('should immediately invoke callback with the queued token', () => {
      const queuedToken = 'queued-token';
      tokenManager.setAccessToken(queuedToken);

      const mockCallback = vi.fn();
      tokenManager.registerCallback(mockCallback);

      expect(mockCallback).toHaveBeenCalledExactlyOnceWith(queuedToken);
      expect(tokenManager.getAccessToken()).toBe(queuedToken);
    });

    it('should clear queued token after first callback registration', () => {
      const queuedToken = 'queued-token';
      tokenManager.setAccessToken(queuedToken);

      // Register first callback - should receive queued token
      const mockCallback1 = vi.fn();
      tokenManager.registerCallback(mockCallback1);
      expect(mockCallback1).toHaveBeenCalledWith(queuedToken);

      // Register second callback - should NOT receive queued token (already cleared)
      const mockCallback2 = vi.fn();
      tokenManager.registerCallback(mockCallback2);
      expect(mockCallback2).not.toHaveBeenCalled();
    });

    it('should handle multiple token updates before callback registration', () => {
      tokenManager.setAccessToken('token-1');
      tokenManager.setAccessToken('token-2');
      tokenManager.setAccessToken('final-token');

      const mockCallback = vi.fn();
      tokenManager.registerCallback(mockCallback);

      // Should only receive the latest token
      expect(mockCallback).toHaveBeenCalledExactlyOnceWith('final-token');
      expect(tokenManager.getAccessToken()).toBe('final-token');
    });

    it('should notify callbacks for subsequent token updates after registration', () => {
      tokenManager.setAccessToken('queued-token');

      const mockCallback = vi.fn();
      tokenManager.registerCallback(mockCallback);

      // Should have received queued token
      expect(mockCallback).toHaveBeenCalledWith('queued-token');

      // Update token again - should be notified
      tokenManager.setAccessToken('updated-token');
      expect(mockCallback).toHaveBeenCalledWith('updated-token');
      expect(mockCallback).toHaveBeenCalledTimes(2);
    });
  });
});
