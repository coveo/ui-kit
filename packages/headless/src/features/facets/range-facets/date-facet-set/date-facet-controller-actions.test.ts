import {ThunkExtraArguments} from '../../../../app/thunk-extra-arguments';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../../../test/mock-engine-v2';
import {createMockState} from '../../../../test/mock-state';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions';
import {
  executeToggleRangeFacetExclude,
  executeToggleRangeFacetSelect,
} from '../generic/range-facet-controller-actions';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from './date-facet-actions';
import {
  executeToggleDateFacetExclude,
  executeToggleDateFacetSelect,
} from './date-facet-controller-actions';

jest.mock('../generic/range-facet-controller-actions');
jest.mock('../../../facet-options/facet-options-actions');
jest.mock('./date-facet-actions');

describe('date facet controller actions', () => {
  let engine: MockedSearchEngine;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
  });

  it('#executeToggleDateFacetSelect dispatches the correct actions', () => {
    const selection = buildMockDateFacetValue();
    executeToggleDateFacetSelect({facetId, selection})(
      engine.dispatch,
      () => engine.state as Required<typeof engine.state>,
      {validatePayload: jest.fn()} as unknown as ThunkExtraArguments
    );
    expect(toggleSelectDateFacetValue).toHaveBeenCalledWith({
      facetId,
      selection,
    });
    expect(executeToggleRangeFacetSelect).toHaveBeenCalledWith({
      facetId,
      selection,
    });
    expect(updateFacetOptions).toHaveBeenCalled();
  });

  it('#executeToggleDateFacetExclude dispatches the correct actions', () => {
    const selection = buildMockDateFacetValue();
    executeToggleDateFacetExclude({facetId, selection})(
      engine.dispatch,
      () => engine.state as Required<typeof engine.state>,
      {validatePayload: jest.fn()} as unknown as ThunkExtraArguments
    );

    expect(toggleExcludeDateFacetValue).toHaveBeenCalledWith({
      facetId,
      selection,
    });
    expect(executeToggleRangeFacetExclude).toHaveBeenCalledWith({
      facetId,
      selection,
    });
    expect(updateFacetOptions).toHaveBeenCalled();
  });
});
