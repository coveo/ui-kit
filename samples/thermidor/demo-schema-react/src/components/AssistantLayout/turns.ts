import type {DiscoveredSurface, Turn} from '@coveo/thermidor';

/** The root of the search block: the results the shopper filters, sorts and pages. */
export const SEARCH_ROOT = 'CommerceSearch';

/** The turn's blocks other than search results: what the assistant answered with. */
export function answerSurfaces(turn: Turn): DiscoveredSurface[] {
  return turn.response.surfaces.filter((surface) => surface.rootComponentType !== SEARCH_ROOT);
}

/** Whether the agent said or did anything in the turn: text or reasoning. */
export function hasAgentContent(turn: Turn): boolean {
  const agent = turn.response.agent;
  return (
    !!agent &&
    (agent.reasoningSteps.length > 0 ||
      agent.messages.some((message) => message.content.length > 0))
  );
}

/** A turn that only produced search results: the results panel shows them, the chat does not. */
export function isSearchOnly(turn: Turn): boolean {
  return (
    turn.status !== 'error' &&
    !hasAgentContent(turn) &&
    answerSurfaces(turn).length === 0 &&
    turn.response.surfaces.length > 0
  );
}

/** The newest search results and the turn that owns them, for the results panel. */
export function latestSearch(
  turns: readonly Turn[]
): {turn: Turn; surface: DiscoveredSurface} | undefined {
  for (let index = turns.length - 1; index >= 0; index--) {
    const turn = turns[index];
    const surface = turn.response.surfaces.find(
      ({rootComponentType}) => rootComponentType === SEARCH_ROOT
    );
    if (surface) {
      return {turn, surface};
    }
  }
  return undefined;
}
