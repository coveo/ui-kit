import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {ToggleSelectFacetValueActionCreatorPayload} from '../../../../ssr.index';
import {commerceFacetSetReducer as commerceFacetSet} from '../facet-set/facet-set-slice';
import {
  ToggleExcludeFacetValueActionCreatorPayload,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from './regular-facet-actions';

export type {
  ToggleExcludeFacetValueActionCreatorPayload,
  ToggleSelectFacetValueActionCreatorPayload,
};

export interface RegularFacetActionCreators {
  toggleExcludeFacetValue(
    payload: ToggleExcludeFacetValueActionCreatorPayload
  ): PayloadAction<ToggleExcludeFacetValueActionCreatorPayload>;

  toggleSelectFacetValue(
    payload: ToggleSelectFacetValueActionCreatorPayload
  ): PayloadAction<ToggleSelectFacetValueActionCreatorPayload>;
}

export function loadRegularFacetActions(
  engine: CommerceEngine
): RegularFacetActionCreators {
  engine.addReducers({commerceFacetSet});
  return {
    toggleExcludeFacetValue,
    toggleSelectFacetValue,
  };
}
