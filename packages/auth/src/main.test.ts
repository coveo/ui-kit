import {sum} from './auth';

describe('#sum', () => {
  it('adds', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
