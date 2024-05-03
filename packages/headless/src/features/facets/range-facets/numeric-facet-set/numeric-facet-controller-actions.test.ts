import {ThunkExtraArguments} from '../../../../app/thunk-extra-arguments';
import {
  buildMockSearchEngine,
  MockedSearchEngine,
} from '../../../../test/mock-engine-v2';
import {buildMockNumericFacetValue} from '../../../../test/mock-numeric-facet-value';
import {createMockState} from '../../../../test/mock-state';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions';
import {executeToggleRangeFacetSelect} from '../generic/range-facet-controller-actions';
import {toggleSelectNumericFacetValue} from './numeric-facet-actions';
import {
  executeToggleNumericFacetSelect,
  executeToggleNumericFacetExclude,
} from './numeric-facet-controller-actions';

jest.mock('../generic/range-facet-controller-actions');
jest.mock('./numeric-facet-actions');
jest.mock('../../../facet-options/facet-options-actions');

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
      {validatePayload: jest.fn()} as unknown as ThunkExtraArguments
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
      {validatePayload: jest.fn()} as unknown as ThunkExtraArguments
    );
    expect(toggleSelectNumericFacetValue).toHaveBeenCalledWith({
      facetId,
      selection,
    });
    expect(executeToggleRangeFacetSelect).toHaveBeenCalled();
    expect(updateFacetOptions).toHaveBeenCalledWith();
  });
});
