import type {ThunkExtraArguments} from '../../../../app/thunk-extra-arguments.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../../test/mock-engine-v2.js';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value.js';
import {createMockState} from '../../../../test/mock-state.js';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions.js';
import {executeToggleRangeFacetSelect} from '../generic/range-facet-controller-actions.js';
import {toggleSelectNumericFacetValue} from './numeric-facet-actions.js';
import {
  executeToggleNumericFacetExclude,
  executeToggleNumericFacetSelect,
} from './numeric-facet-controller-actions.js';

vi.mock('../generic/range-facet-controller-actions');
vi.mock('./numeric-facet-actions');
vi.mock('../../../facet-options/facet-options-actions');

describe('numeric facet controller actions', () => {
  let engine: MockedSearchEngine;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
  });

  it('#executeToggleNumericFacetSelect dispatches the correct actions', async () => {
    const selection = buildMockNumericFacetValue();
    await executeToggleNumericFacetSelect({facetId, selection})(
      engine.dispatch,
      () => engine.state as Required<typeof engine.state>,
      {validatePayload: vi.fn()} as unknown as ThunkExtraArguments
    );
    expect(toggleSelectNumericFacetValue).toHaveBeenCalledWith({
      facetId,
      selection,
    });
    expect(executeToggleRangeFacetSelect).toHaveBeenCalled();
    expect(updateFacetOptions).toHaveBeenCalledWith();
  });

  it('#executeToggleNumericFacetExclude dispatches the correct actions', async () => {
    const selection = buildMockNumericFacetValue();
    await executeToggleNumericFacetExclude({facetId, selection})(
      engine.dispatch,
      () => engine.state as Required<typeof engine.state>,
      {validatePayload: vi.fn()} as unknown as ThunkExtraArguments
    );
    expect(toggleSelectNumericFacetValue).toHaveBeenCalledWith({
      facetId,
      selection,
    });
    expect(executeToggleRangeFacetSelect).toHaveBeenCalled();
    expect(updateFacetOptions).toHaveBeenCalledWith();
  });
});
