import {once} from './utils';

describe('once', () => {
  it('should call the function only once', () => {
    const myFunction = jest.fn();
    const executeOnce = once(myFunction);
    executeOnce();
    executeOnce();
    expect(myFunction).toHaveBeenCalledTimes(1);
  });
});
