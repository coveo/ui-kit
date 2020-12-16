import {createAsyncThunk} from '@reduxjs/toolkit';
import {NumericFacetValue} from './interfaces/response';
import {AsyncThunkSearchOptions} from '../../../../api/search/search-api-client';
import {
  ConfigurationSection,
  NumericFacetSection,
} from '../../../../state/state-sections';
import {
  executeToggleRangeFacetSelect,
  executeRangeFacetBreadcrumb,
} from '../generic/range-facet-controller-actions';
import {toggleSelectNumericFacetValue} from './numeric-facet-actions';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {RecordValue} from '@coveo/bueno';
import {numericFacetValueDefinition} from '../generic/range-facet-validate-payload';

const definition = {
  facetId: facetIdDefinition,
  selection: new RecordValue({values: numericFacetValueDefinition}),
};

const executeToggleNumericFacetSelectType = 'numericFacet/executeToggleSelect';

/**
 * Toggles the numeric facet value and then executes a search with the appropriate analytics tag.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (NumericFacetValue) The target numeric facet value.
 */
export const executeToggleNumericFacetSelect = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: NumericFacetValue;
  },
  AsyncThunkSearchOptions<ConfigurationSection & NumericFacetSection>
>(
  executeToggleNumericFacetSelectType,
  (payload, {dispatch, extra: {validatePayload}}) => {
    validatePayload(payload, definition);
    dispatch(toggleSelectNumericFacetValue(payload));
    dispatch(executeToggleRangeFacetSelect(payload));
  }
);

/**
 * Selects the breadcrumb numeric facet value and then executes a search with the appropriate analytics tag.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (NumericFacetValue) The target numeric facet value.
 */
export const executeSelectNumericFacetBreadcrumb = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: NumericFacetValue;
  },
  AsyncThunkSearchOptions<ConfigurationSection & NumericFacetSection>
>(
  'numericFacet/executeSelectNumericFacetBreadcrumb',
  (payload, {dispatch, extra: {validatePayload}}) => {
    validatePayload(payload, definition);
    dispatch(toggleSelectNumericFacetValue(payload));
    dispatch(executeRangeFacetBreadcrumb(payload));
  }
);
