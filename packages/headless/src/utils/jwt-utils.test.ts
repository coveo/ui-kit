import {describe, expect, it} from 'vitest';
import {parseJWT, shouldRenewJWT} from './jwt-utils.js';

describe('jwt-utils', () => {
  describe('#parseJWT', () => {
    it('should return null for invalid token', () => {
      expect(parseJWT('')).toBeNull();
      expect(parseJWT('invalid')).toBeNull();
      expect(parseJWT('xx12345678-1234-1234-1234-123456789012')).toBeNull();
      expect(parseJWT(undefined)).toBeNull();
    });

    it('should parse valid token', () => {
      const payload = {
        sub: '1234567890',
        name: 'John Doe',
        iat: 1516239022,
        exp: 1516239022,
      };
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      const parsed = parseJWT(token);

      expect(parsed).toBeDefined();
      expect(parsed?.exp).toBe(1516239022);
      expect(parsed?.sub).toBe('1234567890');
      expect(parsed?.name).toBe('John Doe');
    });
  });

  describe('#shouldRenewJWT', () => {
    it('should return false for invalid token', () => {
      expect(shouldRenewJWT('')).toBe(false);
      expect(shouldRenewJWT('invalid')).toBe(false);
      expect(shouldRenewJWT('xx12345678-1234-1234-1234-123456789012')).toBe(
        false
      );
      expect(shouldRenewJWT(undefined)).toBe(false);
    });

    it('should return false for token without exp field', () => {
      const payload = {sub: '1234567890', name: 'John Doe', iat: 1516239022};
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRenewJWT(token)).toBe(false);
    });

    it('should return true for expired token', () => {
      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
      const payload = {exp: oneHourAgo};
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRenewJWT(token)).toBe(true);
    });

    it('should return false for non-expired token', () => {
      const oneHourFromNow = Math.floor(Date.now() / 1000) + 3600;
      const payload = {exp: oneHourFromNow};
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRenewJWT(token)).toBe(false);
    });

    it('should use default 60 second buffer and return true for token expiring within buffer', () => {
      const thirtySecondsFromNow = Math.floor(Date.now() / 1000) + 30;
      const payload = {exp: thirtySecondsFromNow};
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRenewJWT(token)).toBe(true);
    });

    it('should respect custom buffer settings', () => {
      const fortyFiveSecondsFromNow = Math.floor(Date.now() / 1000) + 45;
      const payload = {exp: fortyFiveSecondsFromNow};
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRenewJWT(token, 30)).toBe(false);
      expect(shouldRenewJWT(token, 60)).toBe(true);
    });

    it('should not renew non-expired tokens with zero buffer', () => {
      const thirtySecondsFromNow = Math.floor(Date.now() / 1000) + 30;
      const payload = {exp: thirtySecondsFromNow};
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRenewJWT(token, 0)).toBe(false);
    });

    it('should still renew expired tokens with zero buffer', () => {
      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
      const payload = {exp: oneHourAgo};
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRenewJWT(token, 0)).toBe(true);
    });

    it('should return true for tokens that expire exactly at buffer time', () => {
      const sixtySecondsFromNow = Math.floor(Date.now() / 1000) + 60;
      const payload = {exp: sixtySecondsFromNow};
      const encodedPayload = btoa(JSON.stringify(payload));
      const token = `header.${encodedPayload}.signature`;

      expect(shouldRenewJWT(token, 60)).toBe(true);
    });
  });
});
