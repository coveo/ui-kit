import {includesAtLeast} from './utils';

describe('utils', () => {
  it("#includesAmount returns false if there's less matching items than specified", () => {
    expect(includesAtLeast(['a', 'b', 'a'], 'a', 3)).toBeFalsy();
  });

  it("#includesAmount returns true if there's equal matching items as specified", () => {
    expect(includesAtLeast(['a', 'b', 'a'], 'a', 2)).toBeTruthy();
  });

  it("#includesAmount returns true if there's more matching items than specified", () => {
    expect(includesAtLeast(['a', 'b', 'a'], 'a', 1)).toBeTruthy();
  });
});
