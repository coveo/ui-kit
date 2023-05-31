import {RecordValue} from '@coveo/bueno';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkOptions} from '../../../../app/async-thunk-options';
import {
  ConfigurationSection,
  NumericFacetSection,
} from '../../../../state/state-sections';
import {updateFacetOptions} from '../../../facet-options/facet-options-actions';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {executeToggleRangeFacetSelect} from '../generic/range-facet-controller-actions';
import {numericFacetValueDefinition} from '../generic/range-facet-validate-payload';
import {NumericFacetValue} from './interfaces/response';
import {toggleSelectNumericFacetValue} from './numeric-facet-actions';

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
