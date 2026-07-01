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

export interface BackendFacetController extends Controller<BackendFacetControllerState> {
  toggleSelect(value: string): void;
  toggleExclude(value: string): void;
  deselectAll(): void;
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
  };
};
