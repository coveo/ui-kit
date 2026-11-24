import {describe, expect, it} from 'vitest';
import {resolveEnableResults} from './enable-results.js';

describe('#resolveEnableResults', () => {
  it('should disable results for both kinds of request by default', () => {
    expect(resolveEnableResults(undefined)).toEqual({listing: false, search: false});
  });

  it('should apply a boolean to both kinds of request', () => {
    expect(resolveEnableResults(true)).toEqual({listing: true, search: true});
    expect(resolveEnableResults(false)).toEqual({listing: false, search: false});
  });

  it('should take each flag of the per-request object and default a missing one to false', () => {
    expect(resolveEnableResults({search: true})).toEqual({listing: false, search: true});
    expect(resolveEnableResults({listing: true, search: false})).toEqual({
      listing: true,
      search: false,
    });
  });
});
