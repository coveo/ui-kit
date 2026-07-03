import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendInterfacesSelectors} from '@/src/core/internal/backend-interfaces/backend-interfaces-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {
  ConverseController,
  BackendInterfaceAction,
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
  interfaceId: string;
  facetId: string;
}

export const buildBackendFacetController = (
  options: BackendFacetControllerOptions
): BackendFacetController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const selectors = getOrCreateBackendInterfacesSelectors(stateId);
  const getInterface = selectors.getInterface(options.interfaceId);
  const getFacetSearchResults = selectors.getFacetSearchResults(
    options.facetId
  );

  let facetSearchQuery = '';

  const controllerState = createMemoizedStateSelector(
    getInterface,
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
      const action: BackendInterfaceAction = {
        type: 'facet_search',
        interfaceId: options.interfaceId,
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
      const action: BackendInterfaceAction = {
        type: 'toggle_facet',
        interfaceId: options.interfaceId,
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
      const action: BackendInterfaceAction = {
        type: 'toggle_facet',
        interfaceId: options.interfaceId,
        facetId: options.facetId,
        value,
      };
      options.converseController.sendAction(action);
    },
    toggleExclude(value) {
      const action: BackendInterfaceAction = {
        type: 'toggle_exclude_facet',
        interfaceId: options.interfaceId,
        facetId: options.facetId,
        value,
      };
      options.converseController.sendAction(action);
    },
    deselectAll() {
      const action: BackendInterfaceAction = {
        type: 'deselect_all_facets',
        interfaceId: options.interfaceId,
        facetId: options.facetId,
      };
      options.converseController.sendAction(action);
    },
    facetSearch,
  };
};
