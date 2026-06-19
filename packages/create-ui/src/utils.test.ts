import {describe, expect, it} from 'vitest';
import {detectPackageManager} from './utils.js';

describe('detectPackageManager', () => {
  it('detects pnpm, and falls back to npm for npm/yarn/unknown agents', () => {
    expect(detectPackageManager('pnpm/9.0.0 npm/? node/v20.0.0')).toBe('pnpm');
    expect(detectPackageManager('npm/10.0.0 node/v20.0.0')).toBe('npm');
    expect(detectPackageManager('yarn/1.22.0 npm/? node/v20.0.0')).toBe('npm');
    expect(detectPackageManager('')).toBe('npm');
  });

  it('falls back to npm when no user agent is set in the environment', () => {
    const previous = process.env.npm_config_user_agent;
    delete process.env.npm_config_user_agent;
    try {
      expect(detectPackageManager()).toBe('npm');
    } finally {
      if (previous !== undefined) {
        process.env.npm_config_user_agent = previous;
      }
    }
  });
});
