import {createAsyncThunk} from '@reduxjs/toolkit';
import {DateFacetValue} from './interfaces/response';
import {
  ConfigurationSection,
  DateFacetSection,
} from '../../../../state/state-sections';
import {executeToggleRangeFacetSelect} from '../generic/range-facet-controller-actions';
import {toggleSelectDateFacetValue} from './date-facet-actions';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {RecordValue} from '@coveo/bueno';
import {dateFacetValueDefinition} from '../generic/range-facet-validate-payload';
import {AsyncThunkOptions} from '../../../../app/async-thunk-options';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions';

const definition = {
  facetId: facetIdDefinition,
  selection: new RecordValue({values: dateFacetValueDefinition}),
};

export const executeToggleDateFacetSelect = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: DateFacetValue;
  },
  AsyncThunkOptions<ConfigurationSection & DateFacetSection>
>(
  'dateFacet/executeToggleSelect',
  (payload, {dispatch, extra: {validatePayload}}) => {
    validatePayload(payload, definition);
    dispatch(toggleSelectDateFacetValue(payload));
    dispatch(executeToggleRangeFacetSelect(payload));
    dispatch(updateFacetOptions({freezeFacetOrder: true}));
  }
);
