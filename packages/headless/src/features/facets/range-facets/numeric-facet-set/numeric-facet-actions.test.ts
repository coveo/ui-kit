import {buildMockSearchAppEngine, MockEngine} from '../../../../test';
import {SearchAppState} from '../../../../state/search-app-state';
import {registerNumericFacet} from './numeric-facet-actions';
import {buildNumericRange} from '../../../../controllers';

describe('numeric facet actions', () => {
  let engine: MockEngine<SearchAppState>;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('#registerNumericFacet throws an error if current values contains an invalid value', () => {
    expect(() =>
      engine.dispatch(
        registerNumericFacet({
          facetId,
          field: 'test',
          generateAutomaticRanges: false,
          currentValues: [buildNumericRange({start: 10, end: 0})],
        })
      )
    ).toThrowError(
      'The start value is greater than the end value for the numeric range 10 to 0'
    );
  });

  it('#registerNumericFacet does not throw an error if current values contains no invalid values', () => {
    expect(() =>
      engine.dispatch(
        registerNumericFacet({
          facetId,
          field: 'test',
          generateAutomaticRanges: false,
          currentValues: [buildNumericRange({start: 0, end: 10})],
        })
      )
    ).not.toThrow();
  });
});
