import {describe, expect, it} from 'vitest';
import {parseAssetURL} from './asset-path-utils';

describe('parseAssetURL', () => {
  it('works with relative urls', () => {
    expect(parseAssetURL('../test.svg')).toBe('../test.svg');
    expect(parseAssetURL('./test.svg')).toBe('./test.svg');
  });

  it('works with the http(s) protocol urls', () => {
    expect(parseAssetURL('https://github.com/coveo/ui-kit/test.svg')).toBe(
      'https://github.com/coveo/ui-kit/test.svg'
    );
    expect(parseAssetURL('http://github.com/coveo/ui-kit/test.svg')).toBe(
      'http://github.com/coveo/ui-kit/test.svg'
    );
  });

  it('works with Atomic assets (without .svg)', () => {
    expect(parseAssetURL('assets://attachment')).toBe('/assets/attachment.svg');
  });

  it('works with Atomic assets (with .svg)', () => {
    expect(parseAssetURL('assets://attachment.svg')).toBe(
      '/assets/attachment.svg'
    );
  });
});
