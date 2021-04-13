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
});
