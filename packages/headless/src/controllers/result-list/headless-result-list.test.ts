import {buildResultList} from './headless-result-list';
import {buildMockSearchAppEngine} from '../../test/mock-engine';

describe('ResultList', () => {
  it('initializes correctly', () => {
    expect(buildResultList(buildMockSearchAppEngine())).toBeTruthy();
  });
});
