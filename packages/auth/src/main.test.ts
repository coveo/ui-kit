import {sum} from './main';

describe('#sum', () => {
  it('adds', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
