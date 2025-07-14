import type {ThunkExtraArguments} from '../../../../app/thunk-extra-arguments.js';
import {buildMockDateFacetValue} from '../../../../test/mock-date-facet-value.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../../test/mock-engine-v2.js';
import {createMockState} from '../../../../test/mock-state.js';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions.js';
import {
  executeToggleRangeFacetExclude,
  executeToggleRangeFacetSelect,
} from '../generic/range-facet-controller-actions.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from './date-facet-actions.js';
import {
  executeToggleDateFacetExclude,
  executeToggleDateFacetSelect,
} from './date-facet-controller-actions.js';

vi.mock('../generic/range-facet-controller-actions');
vi.mock('../../../facet-options/facet-options-actions');
vi.mock('./date-facet-actions');

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
      {validatePayload: vi.fn()} as unknown as ThunkExtraArguments
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
      {validatePayload: vi.fn()} as unknown as ThunkExtraArguments
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
