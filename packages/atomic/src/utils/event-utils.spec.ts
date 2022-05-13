import {listenOnce} from './event-utils';

describe('listenOnce', () => {
  it('only listens to an event once', () => {
    const myFunction = jest.fn();
    const element = document.createElement('div');
    listenOnce(element, 'click', myFunction);
    element.click();
    element.click();
    expect(myFunction).toHaveBeenCalledTimes(1);
  });
});
