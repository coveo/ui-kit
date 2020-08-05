import {
  CategoryFacetSetState,
  getCategoryFacetSetInitialState,
  categoryFacetSetReducer,
} from './category-facet-set-slice';
import {CategoryFacetRegistrationOptions} from './interfaces/options';
import {registerCategoryFacet} from './category-facet-set-actions';
import {buildMockCategoryFacetRequest} from '../../../test/mock-category-facet-request';
import {getHistoryEmptyState} from '../../history/history-slice';
import {change} from '../../history/history-actions';

describe('category facet slice', () => {
  const facetId = '1';
  let state: CategoryFacetSetState;

  beforeEach(() => {
    state = getCategoryFacetSetInitialState();
  });

  it('initializes the set to an empty object', () => {
    const finalState = categoryFacetSetReducer(undefined, {type: ''});
    expect(finalState).toEqual({});
  });

  it('#registerCategoryFacet with an unregistered id adds a category facet with correct defaults', () => {
    const options: CategoryFacetRegistrationOptions = {
      facetId,
      field: '',
    };

    const finalState = categoryFacetSetReducer(
      state,
      registerCategoryFacet(options)
    );

    expect(finalState[facetId]).toEqual({
      ...options,
      currentValues: [],
      filterFacetCount: false,
      injectionDepth: 1000,
      numberOfValues: 5,
      preventAutoSelect: false,
      sortCriteria: 'occurrences',
      delimitingCharacter: '|',
      type: 'hierarchical',
      basePath: [],
      filterByBasePath: true,
    });
  });

  it('#registerCategoryFacet with a registered id does not overwrite a category facet', () => {
    const options: CategoryFacetRegistrationOptions = {
      facetId,
      field: 'b',
    };

    state[facetId] = buildMockCategoryFacetRequest({facetId, field: 'a'});
    const finalState = categoryFacetSetReducer(
      state,
      registerCategoryFacet(options)
    );
    expect(finalState[facetId].field).toBe('a');
  });

  it('it restores the categoryFacetSet on history change', () => {
    const categoryFacetSet = {'1': buildMockCategoryFacetRequest()};
    const payload = {
      ...getHistoryEmptyState(),
      categoryFacetSet,
    };

    const finalState = categoryFacetSetReducer(
      state,
      change.fulfilled(payload, '')
    );

    expect(finalState).toEqual(categoryFacetSet);
  });
});
