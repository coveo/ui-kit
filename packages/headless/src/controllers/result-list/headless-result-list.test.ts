import {ResultList} from './headless-result-list';
import {buildMockEngine} from '../../test/mock-engine';

describe('ResultList', () => {
  it('initializes correctly', () => {
    expect(new ResultList(buildMockEngine())).toBeTruthy();
  });
});
