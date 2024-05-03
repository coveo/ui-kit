import {configuration} from '../../../app/common-reducers';
import {
  applyDidYouMeanCorrection,
  disableAutomaticQueryCorrection,
  enableDidYouMean,
} from '../../../features/did-you-mean/did-you-mean-actions';
import {didYouMeanReducer as didYouMean} from '../../../features/did-you-mean/did-you-mean-slice';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../test/mock-engine-v2';
import {createMockState} from '../../../test/mock-state';
import {
  buildCoreDidYouMean,
  DidYouMean,
  DidYouMeanProps,
} from './headless-core-did-you-mean';

jest.mock('pino', () => ({
  ...jest.requireActual('pino'),
  __esModule: true,
  default: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('../../../features/did-you-mean/did-you-mean-actions');

describe('did you mean', () => {
  let dym: DidYouMean;
  let engine: MockedSearchEngine;

  function initDidYouMean(
    props: DidYouMeanProps = {},
    state = createMockState()
  ) {
    engine = buildMockSearchEngine(state);
    dym = buildCoreDidYouMean(engine, props);
  }

  beforeEach(() => {
    jest.resetAllMocks();
    initDidYouMean();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      didYouMean,
    });
  });

  it('should enable did you mean', () => {
    expect(enableDidYouMean).toHaveBeenCalledTimes(1);
  });

  it('should allow to update query correction', () => {
    const initialState = createMockState();
    initialState.didYouMean.queryCorrection.correctedQuery = 'bar';
    initDidYouMean({}, initialState);

    dym.applyCorrection();
    expect(applyDidYouMeanCorrection).toHaveBeenCalledWith('bar');
  });

  it('should dispatch disableAutomaticQueryCorrection at initialization when specified', () => {
    initDidYouMean({options: {automaticallyCorrectQuery: false}});
    expect(disableAutomaticQueryCorrection).toHaveBeenCalledTimes(1);
  });

  it('should not dispatch disableAutomaticQueryCorrection at initialization when specified', () => {
    initDidYouMean({options: {automaticallyCorrectQuery: true}});
    expect(disableAutomaticQueryCorrection).not.toHaveBeenCalled();
  });

  it('should allow to update query correction when automatic correction is disabled', () => {
    const initialState = createMockState();
    initialState.didYouMean.queryCorrection.correctedQuery = 'bar';
    initDidYouMean({options: {automaticallyCorrectQuery: false}}, initialState);

    dym.applyCorrection();
    expect(applyDidYouMeanCorrection).toHaveBeenCalledWith('bar');
  });
});
