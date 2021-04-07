import {buildDidYouMean} from './headless-did-you-mean';
import {buildMockSearchAppEngine} from '../../test/mock-engine';
import {
  applyDidYouMeanCorrection,
  enableDidYouMean,
} from '../../features/did-you-mean/did-you-mean-actions';

describe('did you mean', () => {
  it('should enable did you mean', () => {
    const e = buildMockSearchAppEngine();

    buildDidYouMean(e);
    expect(e.actions).toContainEqual(enableDidYouMean());
  });

  it('should allow to update query correction', () => {
    const e = buildMockSearchAppEngine();
    e.state.didYouMean.queryCorrection.correctedQuery = 'bar';

    buildDidYouMean(e).applyCorrection();
    expect(e.actions).toContainEqual(applyDidYouMeanCorrection('bar'));
  });

  [
    {corrected: 'university sports', expected: 'university sports1'},
    {corrected: 'sports', expected: 'sports1'},
    {corrected: 'sports university', expected: 'sports1 university'},
    {corrected: 'foo bar', expected: 'foo bar'},
  ].forEach((testCase) => {
    it('should have a state property containing the original performed query', () => {
      const e = buildMockSearchAppEngine();
      e.state.didYouMean.queryCorrection.correctedQuery = testCase.corrected;
      e.state.didYouMean.queryCorrection.wordCorrections = [
        {
          correctedWord: 'sports',
          length: 6,
          offset: 11,
          originalWord: 'sports1',
        },
      ];
      expect(buildDidYouMean(e).state.originalQuery).toBe(testCase.expected);
    });
  });
});
