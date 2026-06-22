import {describe, expect, it} from 'vitest';
import {DEFAULT_REF, getTarballUrl} from './tarball.js';

describe('getTarballUrl', () => {
  it('builds the documented REST API tarball URL for a given ref', () => {
    expect(getTarballUrl('main')).toBe(
      'https://api.github.com/repos/coveo/ui-kit/tarball/main'
    );
  });

  it('falls back to the default ref when none is provided', () => {
    expect(getTarballUrl()).toBe(
      `https://api.github.com/repos/coveo/ui-kit/tarball/${DEFAULT_REF}`
    );
  });

  it('targets the public api.github.com host rather than codeload', () => {
    const url = getTarballUrl('v3.0.0');
    expect(url).toContain('api.github.com');
    expect(url).not.toContain('codeload');
  });
});
