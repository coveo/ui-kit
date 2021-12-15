import {createAsyncThunk} from '@reduxjs/toolkit';
import {NumericFacetValue} from './interfaces/response';
import {
  ConfigurationSection,
  NumericFacetSection,
} from '../../../../state/state-sections';
import {executeToggleRangeFacetSelect} from '../generic/range-facet-controller-actions';
import {toggleSelectNumericFacetValue} from './numeric-facet-actions';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {RecordValue} from '@coveo/bueno';
import {numericFacetValueDefinition} from '../generic/range-facet-validate-payload';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions';
import {AsyncThunkOptions} from '../../../../app/async-thunk-options';

const definition = {
  facetId: facetIdDefinition,
  selection: new RecordValue({values: numericFacetValueDefinition}),
};

const executeToggleNumericFacetSelectType = 'numericFacet/executeToggleSelect';

export const executeToggleNumericFacetSelect = createAsyncThunk<
  void,
  {
    facetId: string;
    selection: NumericFacetValue;
  },
  AsyncThunkOptions<ConfigurationSection & NumericFacetSection>
>(
  executeToggleNumericFacetSelectType,
  (payload, {dispatch, extra: {validatePayload}}) => {
    validatePayload(payload, definition);
    dispatch(toggleSelectNumericFacetValue(payload));
    dispatch(executeToggleRangeFacetSelect(payload));
    dispatch(updateFacetOptions({freezeFacetOrder: true}));
  }
);
