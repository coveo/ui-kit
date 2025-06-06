import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import * as env from './environment';

// Mock @coveo/headless VERSION
vi.mock('@coveo/headless', () => ({VERSION: 'HEADLESS_VERSION'}));

describe('environment', () => {
  const originalCoveoAtomic = (window as Record<string, unknown>)[
    'COVEO_ATOMIC'
  ];
  const originalEnv = process.env.VERSION;

  beforeEach(() => {
    delete (window as Record<string, unknown>)['COVEO_ATOMIC'];
    process.env.VERSION = 'ATOMIC_VERSION';
  });

  afterEach(() => {
    (window as Record<string, unknown>)['COVEO_ATOMIC'] = originalCoveoAtomic;
    process.env.VERSION = originalEnv;
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
