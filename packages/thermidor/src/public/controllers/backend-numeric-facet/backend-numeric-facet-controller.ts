import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendSurfacesSelectors} from '@/src/core/internal/backend-surfaces/backend-surfaces-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {
  ConverseController,
  BackendSurfaceAction,
} from '../converse/converse-controller.js';
import type {Controller} from '../controller-types.js';

export interface NumericFacetValue {
  start: number;
  end: number;
  endInclusive: boolean;
  state: 'idle' | 'selected';
  numberOfResults: number;
}

export interface BackendNumericFacetController extends Controller<BackendNumericFacetControllerState> {
  toggleSelect(value: {
    start: number;
    end: number;
    endInclusive: boolean;
  }): void;
  setRange(range: {start: number; end: number; endInclusive: boolean}): void;
  deselectAll(): void;
}

export interface BackendNumericFacetControllerState {
  facetId: string;
  field: string;
  displayName: string;
  values: NumericFacetValue[];
  hasActiveValues: boolean;
  domain?: {min: number; max: number};
  interval: string;
}

export interface BackendNumericFacetControllerOptions {
  interface: GenerativeInterface;
  converseController: ConverseController;
  surfaceId: string;
  facetId: string;
}

export const buildBackendNumericFacetController = (
  options: BackendNumericFacetControllerOptions
): BackendNumericFacetController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const selectors = getOrCreateBackendSurfacesSelectors(stateId);
  const getSurface = selectors.getSurface(options.surfaceId);

  const controllerState = createMemoizedStateSelector(
    getSurface,
    (entry): BackendNumericFacetControllerState => {
      const facets = entry?.state?.facets as
        | Array<{
            facetId?: string;
            field?: string;
            displayName?: string;
            type?: string;
            values?: Array<{
              start?: number;
              end?: number;
              endInclusive?: boolean;
              state?: string;
              numberOfResults?: number;
            }>;
            domain?: {min: number; max: number};
            interval?: string;
          }>
        | undefined;

      const facet = facets?.find(
        (f) => f.facetId === options.facetId && f.type === 'numericalRange'
      );

      if (!facet) {
        return {
          facetId: options.facetId,
          field: '',
          displayName: '',
          values: [],
          hasActiveValues: false,
          domain: undefined,
          interval: '',
        };
      }

      const values: NumericFacetValue[] = (facet.values ?? []).map((v) => ({
        start: v.start ?? 0,
        end: v.end ?? 0,
        endInclusive: v.endInclusive ?? false,
        state: (v.state as 'idle' | 'selected') ?? 'idle',
        numberOfResults: v.numberOfResults ?? 0,
      }));

      const hasActiveValues = values.some((v) => v.state !== 'idle');

      return {
        facetId: facet.facetId ?? options.facetId,
        field: facet.field ?? '',
        displayName: facet.displayName ?? '',
        values,
        hasActiveValues,
        domain: facet.domain,
        interval: facet.interval ?? '',
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
      const action: BackendSurfaceAction = {
        type: 'toggle_numeric_facet',
        surfaceId: options.surfaceId,
        facetId: options.facetId,
        start: value.start,
        end: value.end,
        endInclusive: value.endInclusive,
      };
      options.converseController.sendAction(action);
    },
    setRange(range) {
      const action: BackendSurfaceAction = {
        type: 'set_numeric_facet_range',
        surfaceId: options.surfaceId,
        facetId: options.facetId,
        start: range.start,
        end: range.end,
        endInclusive: range.endInclusive,
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
  };
};
