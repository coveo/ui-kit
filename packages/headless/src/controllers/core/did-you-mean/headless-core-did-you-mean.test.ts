import {configuration} from '../../../app/common-reducers.js';
import {
  applyDidYouMeanCorrection,
  disableAutomaticQueryCorrection,
  enableDidYouMean,
  setCorrectionMode,
} from '../../../features/did-you-mean/did-you-mean-actions.js';
import {didYouMeanReducer as didYouMean} from '../../../features/did-you-mean/did-you-mean-slice.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {createMockState} from '../../../test/mock-state.js';
import {
  buildCoreDidYouMean,
  type DidYouMean,
  type DidYouMeanOptions,
  type DidYouMeanProps,
} from './headless-core-did-you-mean.js';

vi.mock('pino', async () => {
  const actual = await vi.importActual('pino');
  return {
    ...actual,
    __esModule: true,
    default: () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn(),
    }),
  };
});

vi.mock('../../../features/did-you-mean/did-you-mean-actions');

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
    vi.resetAllMocks();
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

  it('should allow to update the query correction mode', () => {
    const initialState = createMockState();
    initialState.didYouMean.queryCorrectionMode = 'legacy';
    initDidYouMean({}, initialState);
    dym.updateQueryCorrectionMode('next');

    expect(engine.dispatch).toHaveBeenCalledWith(setCorrectionMode('next'));
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

  it('should dispatch setCorrectionMode with the correct value', () => {
    const options = {queryCorrectionMode: 'legacy'} as DidYouMeanOptions;
    initDidYouMean({options});

    expect(engine.dispatch).toHaveBeenCalledWith(setCorrectionMode('legacy'));
  });

  it('should dispatch setCorrectionMode with the default value "next" when no mode is provided', () => {
    initDidYouMean();

    expect(engine.dispatch).toHaveBeenCalledWith(setCorrectionMode('next'));
  });
});
