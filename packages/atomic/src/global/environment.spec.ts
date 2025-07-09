import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import * as env from './environment';

vi.mock('@coveo/headless', () => ({VERSION: 'HEADLESS_VERSION'}));

describe('environment', () => {
  const globalWindow = window as Record<string, unknown>;
  const originalCoveoAtomic = globalWindow['COVEO_ATOMIC'];
  const originalEnv = process.env.VERSION;

  beforeEach(() => {
    delete globalWindow['COVEO_ATOMIC'];
    process.env.VERSION = 'ATOMIC_VERSION';
  });

  afterEach(() => {
    globalWindow['COVEO_ATOMIC'] = originalCoveoAtomic;
    if (originalEnv !== undefined) {
      process.env.VERSION = originalEnv;
    } else {
      delete process.env.VERSION;
    }
  });

  describe('#getAtomicEnvironment', () => {
    it('should return correct versions', () => {
      const result = env.getAtomicEnvironment();

      expect(result).toEqual({
        version: 'ATOMIC_VERSION',
        headlessVersion: 'HEADLESS_VERSION',
      });
    });
  });

  describe('#setCoveoGlobal', () => {
    it('should set the COVEO_ATOMIC global variable when not already set', () => {
      expect(
        (window as Record<string, unknown>)['COVEO_ATOMIC']
      ).toBeUndefined();

      env.setCoveoGlobal('COVEO_ATOMIC');

      expect((window as Record<string, unknown>)['COVEO_ATOMIC']).toEqual({
        version: 'ATOMIC_VERSION',
        headlessVersion: 'HEADLESS_VERSION',
      });
    });

    it('should not overwrite the COVEO_ATOMIC global variable when already set', () => {
      (window as Record<string, unknown>)['COVEO_ATOMIC'] = {
        version: 'EXISTING',
        headlessVersion: 'EXISTING',
      };

      env.setCoveoGlobal('COVEO_ATOMIC');

      expect((window as Record<string, unknown>)['COVEO_ATOMIC']).toEqual({
        version: 'EXISTING',
        headlessVersion: 'EXISTING',
      });
    });
  });
});
