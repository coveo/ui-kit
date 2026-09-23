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
 * (`state: {}`, `activities: []`, `surfaces: []`) and any provided overrides
 * merged on top. `agent` is included only when supplied.
 */
export function makeResponse(overrides: Partial<TurnResponse> = {}): TurnResponse {
  return {
    state: {},
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

/**
 * Builds a typed {@link DiscoveredSurface} projection entry.
 */
export function makeSurface(surfaceId: string, rootComponentType: string): DiscoveredSurface {
  return {surfaceId, rootComponentType};
}
