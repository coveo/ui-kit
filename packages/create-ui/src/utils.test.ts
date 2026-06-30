import {afterEach, describe, expect, it} from 'vitest';
import {formatError, getPackageManager} from './utils.js';

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
    expect(getPackageManager()).toBe('pnpm');
    process.env.npm_config_user_agent = 'npm/10.0.0 node/v20.0.0';
    expect(getPackageManager()).toBe('npm');
  });

  it('falls back to npm when no user agent is set', () => {
    delete process.env.npm_config_user_agent;
    expect(getPackageManager()).toBe('npm');
  });
});

describe('formatError', () => {
  it('returns the message from an Error instance', () => {
    expect(formatError(new Error('something broke'))).toBe('something broke');
  });

  it('returns a fallback for an Error with an empty message', () => {
    expect(formatError(new Error(''))).toBe('An unexpected error occurred.');
  });

  it('returns a string value as-is', () => {
    expect(formatError('network timeout')).toBe('network timeout');
  });

  it('returns a fallback for null, undefined, and empty string', () => {
    expect(formatError(null)).toBe('An unexpected error occurred.');
    expect(formatError(undefined)).toBe('An unexpected error occurred.');
    expect(formatError('')).toBe('An unexpected error occurred.');
  });

  it('returns a fallback for non-Error objects', () => {
    expect(formatError({code: 42})).toBe('An unexpected error occurred.');
  });
});
