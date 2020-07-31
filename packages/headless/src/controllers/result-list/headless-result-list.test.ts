import {buildResultList} from './headless-result-list';
import {buildMockEngine} from '../../test/mock-engine';

describe('ResultList', () => {
  it('initializes correctly', () => {
    expect(buildResultList(buildMockEngine())).toBeTruthy();
  });
});
