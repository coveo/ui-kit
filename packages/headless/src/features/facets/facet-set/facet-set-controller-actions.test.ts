import {ThunkExtraArguments} from '../../../app/thunk-extra-arguments';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../../test/mock-engine-v2';
import {buildMockFacetValue} from '../../../test/mock-facet-value';
import {createMockState} from '../../../test/mock-state';
import {updateFacetOptions} from '../../facet-options/facet-options-actions';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from './facet-set-actions';
import {
  executeToggleFacetExclude,
  executeToggleFacetSelect,
} from './facet-set-controller-actions';

jest.mock('./facet-set-actions');
jest.mock('../../facet-options/facet-options-actions');

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
      {validatePayload: jest.fn()} as unknown as ThunkExtraArguments
    );

    expect(toggleSelectFacetValue).toHaveBeenCalledWith({facetId, selection});
    expect(updateFacetOptions).toHaveBeenCalledWith();
  });

  it('#executeToggleExclude dispatches the correct actions', async () => {
    const selection = buildMockFacetValue({value: 'test'});
    await executeToggleFacetExclude({facetId, selection})(
      engine.dispatch,
      () => engine.state as Required<typeof engine.state>,
      {validatePayload: jest.fn()} as unknown as ThunkExtraArguments
    );

    expect(toggleExcludeFacetValue).toHaveBeenCalledWith({facetId, selection});
    expect(updateFacetOptions).toHaveBeenCalledWith();
  });
});
