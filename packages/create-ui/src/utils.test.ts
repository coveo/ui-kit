import {afterEach, describe, expect, it} from 'vitest';
import {getPackageManager} from './utils.js';

describe('getPackageManager', () => {
  const original = process.env.npm_config_user_agent;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.npm_config_user_agent;
    } else {
      process.env.npm_config_user_agent = original;
    }
  });

  it('returns the package manager name from the user agent', () => {
    process.env.npm_config_user_agent = 'pnpm/9.0.0 npm/? node/v20.0.0';
    expect(getPackageManager(true)).toBe('pnpm');
    process.env.npm_config_user_agent = 'npm/10.0.0 node/v20.0.0';
    expect(getPackageManager(true)).toBe('npm');
  });

  it('falls back to npm when no user agent is set', () => {
    delete process.env.npm_config_user_agent;
    expect(getPackageManager(true)).toBe('npm');
  });
});
