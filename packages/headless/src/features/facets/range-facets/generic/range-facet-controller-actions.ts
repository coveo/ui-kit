import {createAsyncThunk} from '@reduxjs/toolkit';
import {ConfigurationSection} from '../../../../state/state-sections';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions';
import {
  RangeFacetSelectionPayload,
  rangeFacetSelectionPayloadDefinition,
} from './range-facet-validate-payload';
import {AsyncThunkOptions} from '../../../../app/async-thunk-options';

/**
 * Executes a search with the appropriate analytics for a toggle range facet value
 * @param payload (RangeFacetSelectionPayload) Object specifying the target facet and selection.
 */
export const executeToggleRangeFacetSelect = createAsyncThunk<
  void,
  RangeFacetSelectionPayload,
  AsyncThunkOptions<ConfigurationSection>
>(
  'rangeFacet/executeToggleSelect',
  ({facetId, selection}, {dispatch, extra: {validatePayload}}) => {
    validatePayload(
      {facetId, selection},
      rangeFacetSelectionPayloadDefinition(selection)
    );

    dispatch(updateFacetOptions({freezeFacetOrder: true}));
  }
);
