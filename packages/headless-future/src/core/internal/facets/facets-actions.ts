import {createAction} from '@reduxjs/toolkit';
import type {
  FacetState,
  FacetValue,
} from '@/src/core/interface/facets/facets-types.js';
import type {CoveoFacetResponse} from '@/src/core/interface/api/search-endpoint/search-endpoint-types.js';

const ACTION_PREFIX = 'facets';

export const setFacet = createAction<FacetState>(`${ACTION_PREFIX}/setFacet`);

export const toggleFacetValue = createAction<{
  facetId: string;
  valueId: string;
}>(`${ACTION_PREFIX}/toggleFacetValue`);

export const clearFacetSelections = createAction<string>(
  `${ACTION_PREFIX}/clearFacetSelections`
);

export const updateFacetValues = createAction<{
  facetId: string;
  values: FacetValue[];
}>(`${ACTION_PREFIX}/updateFacetValues`);

export const updateFromResponse = createAction<
  CoveoFacetResponse[] | undefined
>(`${ACTION_PREFIX}/updateFromResponse`);
