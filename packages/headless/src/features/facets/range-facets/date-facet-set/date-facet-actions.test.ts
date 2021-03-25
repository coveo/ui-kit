import {buildMockSearchAppEngine, MockEngine} from '../../../../test';
import {SearchAppState} from '../../../../state/search-app-state';
import {registerDateFacet} from './date-facet-actions';
import {buildDateRange} from '../../../../controllers';

describe('date facet controller actions', () => {
  let engine: MockEngine<SearchAppState>;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
  });

  it('#registerDateFacet throws an error when currentValues contains an invalid range', () => {
    expect(() =>
      engine.dispatch(
        registerDateFacet({
          facetId,
          field: 'test',
          generateAutomaticRanges: false,
          currentValues: [
            buildDateRange({start: 1616679091000, end: 1616592691000}),
          ],
        })
      )
    ).toThrowError(
      'The start value is greater than the end value for the date range 2021/03/25@13:31:31 to 2021/03/24@13:31:31'
    );
  });

  it('#registerDateFacet does not throw an error when currentValues contains only valid ranges', () => {
    expect(() =>
      engine.dispatch(
        registerDateFacet({
          facetId,
          field: 'test',
          generateAutomaticRanges: false,
          currentValues: [buildDateRange({start: 0, end: 10})],
        })
      )
    ).not.toThrow();
  });
});
