import {ResultList} from './headless-result-list';
import {Engine} from '../../app/headless-engine';

describe('ResultList', () => {
  it('initializes correctly', () => {
    // TODO: create a mock engine utility
    expect(new ResultList({} as Engine)).toBeTruthy();
  });
});
