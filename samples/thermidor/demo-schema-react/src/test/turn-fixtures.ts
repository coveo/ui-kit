import type {DiscoveredSurface, Turn, TurnResponse} from '@coveo/thermidor';

/**
 * Shared builders for the reshaped {@link Turn} model (ADR-010). Tests construct
 * turns through these helpers so a single place owns the
 * `{id, input: {prompt}, response: {state, activities, surfaces, agent?}, status}`
 * shape, matching the post-rework session surface.
 */

interface MakeTurnOptions {
  id?: string;
  prompt?: string;
  status?: Turn['status'];
  error?: string;
  response?: Partial<TurnResponse>;
}

/**
 * Builds a {@link TurnResponse} with the non-optional fields defaulted
 * (`activities: []`, `surfaces: []`) and any provided overrides merged on top.
 * `agent` is included only when supplied.
 */
export function makeResponse(overrides: Partial<TurnResponse> = {}): TurnResponse {
  return {
    activities: [],
    surfaces: [],
    ...overrides,
  };
}

/**
 * Builds a {@link Turn} in the reshaped model. The prompt lands on
 * `input.prompt`; the streamed result lands on `response`. Pass `response`
 * overrides to populate `activities`, `surfaces`, `state`, or `agent`.
 */
export function makeTurn(options: MakeTurnOptions = {}): Turn {
  const {id = 'turn-1', prompt = 'test prompt', status = 'complete', error, response} = options;

  return {
    id,
    input: prompt === undefined ? {} : {prompt},
    response: makeResponse(response),
    status,
    ...(error !== undefined ? {error} : {}),
  };
}

/** Builds the {@link DiscoveredSurface} entries of a turn's `response.surfaces` from their ids. */
export function makeSurfaces(...surfaceIds: string[]): DiscoveredSurface[] {
  return surfaceIds.map((surfaceId) => ({
    surfaceId,
    rootComponentType: 'CommerceSearch',
    isLoading: false,
  }));
}

/**
 * Builds a turn opened by a `NextActionsBar` chip with the text `text`: a follow-up, or a search
 * option when `searchOption` is set.
 */
export function makeFollowUpTurn(
  options: MakeTurnOptions & {text?: string; searchOption?: boolean} = {}
): Turn {
  const {text = 'Show more', searchOption = false, ...turnOptions} = options;
  return {
    ...makeTurn(turnOptions),
    input: {
      action: {
        component: 'NextActionsBar',
        name: searchOption ? 'selectSearchOption' : 'selectAction',
        surfaceId: 'next-actions-surface',
        sourceComponentId: 'root',
        context: searchOption ? {optionId: 'option-1', text} : {text, type: 'followup'},
      },
    },
  };
}
