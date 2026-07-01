import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateBackendInterfacesSelectors} from '@/src/core/internal/backend-interfaces/backend-interfaces-selectors.js';
import {getOrCreateGenerativeSelectors} from '@/src/core/internal/generative/generative-selectors.js';
import type {GenerativeInterface} from '@/src/public/interfaces/generative.js';
import type {
  ConverseController,
  BackendInterfaceAction,
} from '../converse/converse-controller.js';
import type {Controller} from '../controller-types.js';

export interface BackendUrlManagerController extends Controller<BackendUrlManagerControllerState> {
  synchronize(fragment: string): void;
}

export interface BackendUrlManagerControllerState {
  fragment: string;
}

export interface BackendUrlManagerControllerOptions {
  interface: GenerativeInterface;
  converseController: ConverseController;
  interfaceId: string;
}

interface FacetParam {
  facetId: string;
  field: string;
  values: string[];
}

export function serializeInterfaceState(
  csid: string | undefined,
  interfaceId: string,
  state: Record<string, unknown>
): string {
  const params = new URLSearchParams();

  if (csid) {
    params.set('csid', csid);
  }
  params.set('iid', interfaceId);

  const query = state.query as string | undefined;
  if (query) {
    params.set('q', query);
  }

  const facets = state.facets as
    | Array<{
        facetId: string;
        field: string;
        values: Array<{value: string; state: string}>;
      }>
    | undefined;
  if (facets) {
    for (const facet of facets) {
      const selected = facet.values
        .filter((v) => v.state === 'selected')
        .map((v) => v.value);
      if (selected.length) {
        params.set(`f-${facet.field}`, selected.join(','));
      }
    }
  }

  const pagination = state.pagination as
    | {page?: number; pageSize?: number}
    | undefined;
  if (pagination?.page && pagination.page > 0) {
    params.set('page', String(pagination.page));
  }

  const sort = state.sort as
    | {
        appliedSort?: {
          sortCriteria: string;
          fields?: Array<{field: string; direction: string}>;
        };
      }
    | undefined;
  if (sort?.appliedSort) {
    const {sortCriteria, fields} = sort.appliedSort;
    if (sortCriteria === 'relevance') {
      params.set('sort', 'relevance');
    } else if (sortCriteria === 'fields' && fields?.length) {
      params.set(
        'sort',
        fields.map((f) => `${f.field}:${f.direction}`).join(',')
      );
    }
  }

  return params.toString();
}

export function deserializeFragment(fragment: string): {
  csid?: string;
  interfaceId?: string;
  query?: string;
  facets?: FacetParam[];
  page?: number;
  sort?: {
    sortCriteria: string;
    fields?: Array<{field: string; direction: string}>;
  };
} {
  const params = new URLSearchParams(fragment);
  const result: ReturnType<typeof deserializeFragment> = {};

  const csid = params.get('csid');
  if (csid) result.csid = csid;

  const iid = params.get('iid');
  if (iid) result.interfaceId = iid;

  const q = params.get('q');
  if (q) result.query = q;

  const page = params.get('page');
  if (page) result.page = parseInt(page, 10);

  const sortParam = params.get('sort');
  if (sortParam) {
    if (sortParam === 'relevance') {
      result.sort = {sortCriteria: 'relevance'};
    } else {
      const fields = sortParam.split(',').map((part) => {
        const [field, direction] = part.split(':');
        return {field, direction: direction ?? 'asc'};
      });
      result.sort = {sortCriteria: 'fields', fields};
    }
  }

  const facets: FacetParam[] = [];
  for (const [key, value] of params.entries()) {
    if (key.startsWith('f-')) {
      const field = key.slice(2);
      facets.push({facetId: field, field, values: value.split(',')});
    }
  }
  if (facets.length) result.facets = facets;

  return result;
}

function areFragmentsEquivalent(a: string, b: string): boolean {
  const parsedA = deserializeFragment(a);
  const parsedB = deserializeFragment(b);

  if (parsedA.csid !== parsedB.csid) return false;
  if (parsedA.interfaceId !== parsedB.interfaceId) return false;
  if (parsedA.query !== parsedB.query) return false;
  if (parsedA.page !== parsedB.page) return false;

  const sortA = JSON.stringify(parsedA.sort ?? null);
  const sortB = JSON.stringify(parsedB.sort ?? null);
  if (sortA !== sortB) return false;

  const facetsA = normalizeFacets(parsedA.facets);
  const facetsB = normalizeFacets(parsedB.facets);
  return facetsA === facetsB;
}

function normalizeFacets(facets?: FacetParam[]): string {
  if (!facets || !facets.length) return '';
  return facets
    .map((f) => `${f.field}=${[...f.values].sort().join(',')}`)
    .sort()
    .join('&');
}

export const buildBackendUrlManagerController = (
  options: BackendUrlManagerControllerOptions
): BackendUrlManagerController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];
  const biSelectors = getOrCreateBackendInterfacesSelectors(stateId);
  const genSelectors = getOrCreateGenerativeSelectors(stateId);
  const getInterface = biSelectors.getInterface(options.interfaceId);

  let previousFragment = '';
  let previousResponseId: string | undefined;
  let isSynchronizing = false;

  const controllerState = createMemoizedStateSelector(
    getInterface,
    genSelectors.getConversationSessionId,
    (entry, csid): BackendUrlManagerControllerState => {
      if (!entry || entry.display !== 'main') {
        return {fragment: previousFragment};
      }
      const fragment = serializeInterfaceState(
        csid,
        options.interfaceId,
        entry.state
      );
      return {fragment};
    }
  );

  return {
    get state() {
      return engine.read(controllerState);
    },

    subscribe(callback) {
      const entry = engine.read(getInterface);
      previousResponseId = (entry?.state?.responseId as string) ?? undefined;
      previousFragment = engine.read(controllerState).fragment;

      return engine.subscribe(controllerState, () => {
        const currentState = engine.read(controllerState);
        const newFragment = currentState.fragment;

        const currentEntry = engine.read(getInterface);
        const newResponseId =
          (currentEntry?.state?.responseId as string) ?? undefined;
        const responseIdChanged = newResponseId !== previousResponseId;

        if (
          !isSynchronizing &&
          responseIdChanged &&
          !areFragmentsEquivalent(previousFragment, newFragment)
        ) {
          previousFragment = newFragment;
          previousResponseId = newResponseId;
          callback();
        } else {
          previousResponseId = newResponseId;
        }
      });
    },

    synchronize(fragment) {
      const parsed = deserializeFragment(fragment);

      previousFragment = fragment;
      isSynchronizing = true;

      if (parsed.csid) {
        const currentSessionId = engine.read(
          genSelectors.getConversationSessionId
        );
        if (currentSessionId !== parsed.csid) {
          const storedToken =
            typeof sessionStorage !== 'undefined'
              ? sessionStorage.getItem(`coveo-ct-${parsed.csid}`)
              : null;
          if (storedToken) {
            options.converseController.restoreSession(parsed.csid, storedToken);
          }
        }
      }

      const interfaceId = parsed.interfaceId ?? options.interfaceId;

      const action: BackendInterfaceAction = {
        type: 'restore_state',
        interfaceId,
        query: parsed.query,
        facets: parsed.facets?.map((f) => ({
          facetId: f.facetId,
          values: f.values,
        })),
        page: parsed.page ?? 0,
        sort: parsed.sort,
      };

      options.converseController.sendAction(action);

      queueMicrotask(() => {
        isSynchronizing = false;
      });
    },
  };
};
