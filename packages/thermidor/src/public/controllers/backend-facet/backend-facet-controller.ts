import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendSurfacesSelectors} from '@/src/core/internal/backend-surfaces/backend-surfaces-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {
  ConverseController,
  BackendSurfaceAction,
} from '../converse/converse-controller.js';
import type {Controller} from '../controller-types.js';

export interface BackendFacetValue {
  value: string;
  state: 'idle' | 'selected' | 'excluded';
  numberOfResults: number;
}

export interface BackendFacetSearchValue {
  displayValue: string;
  rawValue: string;
  count: number;
}

export interface BackendFacetSearchState {
  query: string;
  values: BackendFacetSearchValue[];
  moreValuesAvailable: boolean;
}

export interface BackendFacetSearch {
  updateText(query: string): void;
  search(): void;
  clear(): void;
  select(value: BackendFacetSearchValue): void;
  get state(): BackendFacetSearchState;
  subscribe(callback: () => void): () => void;
}

export interface BackendFacetController extends Controller<BackendFacetControllerState> {
  toggleSelect(value: string): void;
  toggleExclude(value: string): void;
  deselectAll(): void;
  facetSearch: BackendFacetSearch;
}

export interface BackendFacetControllerState {
  facetId: string;
  field: string;
  displayName: string;
  values: BackendFacetValue[];
  hasActiveValues: boolean;
  moreValuesAvailable: boolean;
}

export interface BackendFacetControllerOptions {
  interface: GenerativeInterface;
  converseController: ConverseController;
  surfaceId: string;
  facetId: string;
}

export const buildBackendFacetController = (
  options: BackendFacetControllerOptions
): BackendFacetController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const selectors = getOrCreateBackendSurfacesSelectors(stateId);
  const getSurface = selectors.getSurface(options.surfaceId);
  const getFacetSearchResults = selectors.getFacetSearchResults(
    options.facetId
  );

  let facetSearchQuery = '';

  const controllerState = createMemoizedStateSelector(
    getSurface,
    (entry): BackendFacetControllerState => {
      const facets = entry?.state?.facets as
        | Array<{
            facetId?: string;
            field?: string;
            displayName?: string;
            type?: string;
            values?: BackendFacetValue[];
            moreValuesAvailable?: boolean;
          }>
        | undefined;

      const facet = facets?.find((f) => f.facetId === options.facetId);

      if (!facet) {
        return {
          facetId: options.facetId,
          field: '',
          displayName: '',
          values: [],
          hasActiveValues: false,
          moreValuesAvailable: false,
        };
      }

      const values: BackendFacetValue[] = facet.values ?? [];
      const hasActiveValues = values.some((v) => v.state !== 'idle');

      return {
        facetId: facet.facetId ?? options.facetId,
        field: facet.field ?? '',
        displayName: facet.displayName ?? '',
        values,
        hasActiveValues,
        moreValuesAvailable: facet.moreValuesAvailable ?? false,
      };
    }
  );

  const facetSearchState = createMemoizedStateSelector(
    getFacetSearchResults,
    (results): BackendFacetSearchState => ({
      query: results?.query ?? facetSearchQuery,
      values: results?.values ?? [],
      moreValuesAvailable: results?.moreValuesAvailable ?? false,
    })
  );

  const facetSearch: BackendFacetSearch = {
    updateText(query: string) {
      facetSearchQuery = query;
    },
    search() {
      if (!facetSearchQuery) return;
      const action: BackendSurfaceAction = {
        type: 'facet_search',
        surfaceId: options.surfaceId,
        facetId: options.facetId,
        query: facetSearchQuery,
      };
      options.converseController.sendAction(action);
    },
    clear() {
      facetSearchQuery = '';
    },
    select(value: BackendFacetSearchValue) {
      facetSearchQuery = '';
      const action: BackendSurfaceAction = {
        type: 'toggle_facet',
        surfaceId: options.surfaceId,
        facetId: options.facetId,
        value: value.rawValue,
      };
      options.converseController.sendAction(action);
    },
    get state() {
      return engine.read(facetSearchState);
    },
    subscribe(callback) {
      return engine.subscribe(facetSearchState, callback);
    },
  };

  return {
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback) {
      return engine.subscribe(controllerState, callback);
    },
    toggleSelect(value) {
      const action: BackendSurfaceAction = {
        type: 'toggle_facet',
        surfaceId: options.surfaceId,
        facetId: options.facetId,
        value,
      };
      options.converseController.sendAction(action);
    },
    toggleExclude(value) {
      const action: BackendSurfaceAction = {
        type: 'toggle_exclude_facet',
        surfaceId: options.surfaceId,
        facetId: options.facetId,
        value,
      };
      options.converseController.sendAction(action);
    },
    deselectAll() {
      const action: BackendSurfaceAction = {
        type: 'deselect_all_facets',
        surfaceId: options.surfaceId,
        facetId: options.facetId,
      };
      options.converseController.sendAction(action);
    },
    facetSearch,
  };
};
