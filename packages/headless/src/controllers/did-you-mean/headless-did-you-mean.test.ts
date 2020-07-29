import {buildDidYouMean} from './headless-did-you-mean';
import {buildMockEngine} from '../../test/mock-engine';
import {
  didYouMeanCorrection,
  enableDidYouMean,
} from '../../features/did-you-mean/did-you-mean-actions';

describe('did you mean', () => {
  it('should enable did you mean', () => {
    const e = buildMockEngine();

    buildDidYouMean(e);
    expect(e.actions).toContainEqual(enableDidYouMean());
  });

  it('should allow to update query correction', () => {
    const e = buildMockEngine();
    e.state.didYouMean.queryCorrection.correctedQuery = 'bar';

    buildDidYouMean(e).applyCorrection();
    expect(e.actions).toContainEqual(didYouMeanCorrection('bar'));
  });
});
