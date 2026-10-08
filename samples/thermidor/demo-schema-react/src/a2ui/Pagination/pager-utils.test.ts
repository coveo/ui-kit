import {describe, expect, it} from 'vitest';
import {getCurrentPagesRange} from './pager-utils.js';

describe('getCurrentPagesRange', () => {
  it('centers the range on the current page', () => {
    expect(getCurrentPagesRange(20, 5, 40)).toEqual([18, 19, 20, 21, 22]);
  });

  it('shifts the range right when it would start before the first page', () => {
    expect(getCurrentPagesRange(0, 5, 40)).toEqual([0, 1, 2, 3, 4]);
    expect(getCurrentPagesRange(1, 5, 40)).toEqual([0, 1, 2, 3, 4]);
  });

  it('shifts the range left when it would end after the last page', () => {
    expect(getCurrentPagesRange(40, 5, 40)).toEqual([36, 37, 38, 39, 40]);
    expect(getCurrentPagesRange(39, 5, 40)).toEqual([36, 37, 38, 39, 40]);
  });

  it('returns every page when there are fewer pages than desired', () => {
    expect(getCurrentPagesRange(1, 5, 2)).toEqual([0, 1, 2]);
  });

  it('places the extra page after the current page for an even range', () => {
    expect(getCurrentPagesRange(20, 4, 40)).toEqual([18, 19, 20, 21]);
  });
});
