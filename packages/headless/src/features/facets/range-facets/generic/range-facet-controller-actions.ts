import {createAsyncThunk} from '@reduxjs/toolkit';
import {RangeFacetValue} from './interfaces/range-facet';
import {AsyncThunkSearchOptions} from '../../../../api/search/search-api-client';
import {ConfigurationSection} from '../../../../state/state-sections';
import {getAnalyticsActionForToggleRangeFacetSelect} from './range-facet-utils';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions';
import {executeSearch} from '../../../search/search-actions';
import {validatePayloadSchema} from '../../../../utils/validate-payload';
import {RecordValue} from '@coveo/bueno';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {
  numericFacetValueDefinition,
  dateFacetValueDefinition,
} from './range-facet-validate-payload';

/**
 * Executes a search with the appropriate analytics for a toggle range facet value
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (RangeFacetValue) The target range facet value.
 */
export const executeToggleRangeFacetSelect = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: RangeFacetValue;
  },
  AsyncThunkSearchOptions<ConfigurationSection>
>('rangeFacet/executeToggleSelect', ({facetId, selection}, {dispatch}) => {
  validatePayloadSchema(
    {facetId, selection},
    {facetId: facetIdDefinition, selection: getSelectionDefinition(selection)}
  );

  const analyticsAction = getAnalyticsActionForToggleRangeFacetSelect(
    facetId,
    selection
  );

  dispatch(updateFacetOptions({freezeFacetOrder: true}));
  dispatch(executeSearch(analyticsAction));
});

const getSelectionDefinition = (selection: RangeFacetValue) => {
  if (typeof selection.start === 'string') {
    return new RecordValue({values: dateFacetValueDefinition});
  }
  return new RecordValue({values: numericFacetValueDefinition});
};
