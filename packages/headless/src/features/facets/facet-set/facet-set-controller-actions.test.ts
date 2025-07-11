import type {ThunkExtraArguments} from '../../../app/thunk-extra-arguments.js';
import {
  buildMockSearchEngine,
  type MockedSearchEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockFacetValue} from '../../../test/mock-facet-value.js';
import {createMockState} from '../../../test/mock-state.js';
import {updateFacetOptions} from '../../facet-options/facet-options-actions.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from './facet-set-actions.js';
import {
  executeToggleFacetExclude,
  executeToggleFacetSelect,
} from './facet-set-controller-actions.js';

vi.mock('./facet-set-actions');
vi.mock('../../facet-options/facet-options-actions');

describe('facet set controller actions', () => {
  let engine: MockedSearchEngine;
  const facetId = 'test';

  beforeEach(() => {
    engine = buildMockSearchEngine(createMockState());
  });

  it('#executeToggleFacetSelect dispatches the correct actions', async () => {
    const selection = buildMockFacetValue({value: 'test'});
    await executeToggleFacetSelect({facetId, selection})(
      engine.dispatch,
      () => engine.state as Required<typeof engine.state>,
      {validatePayload: vi.fn()} as unknown as ThunkExtraArguments
    );

    expect(toggleSelectFacetValue).toHaveBeenCalledWith({facetId, selection});
    expect(updateFacetOptions).toHaveBeenCalledWith();
  });

  it('#executeToggleExclude dispatches the correct actions', async () => {
    const selection = buildMockFacetValue({value: 'test'});
    await executeToggleFacetExclude({facetId, selection})(
      engine.dispatch,
      () => engine.state as Required<typeof engine.state>,
      {validatePayload: vi.fn()} as unknown as ThunkExtraArguments
    );

    expect(toggleExcludeFacetValue).toHaveBeenCalledWith({facetId, selection});
    expect(updateFacetOptions).toHaveBeenCalledWith();
  });
});
