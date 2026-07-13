/** @typedef {import("coveo").GenerationStep} GenerationStep */
/** @typedef {'thinking-before-search'|'searching'|'searching-with-query'|'thinking-after-search'|'answering'} ResolvedStepName */
/**
 * @typedef {Object} ResolvedStep
 * @property {ResolvedStepName} name
 * @property {'active'|'completed'} status
 * @property {string} [searchQuery]
 */

/**
 * Maps an array of raw generation steps to resolved steps with a normalized type.
 * @param {GenerationStep[]} steps
 * @returns {ResolvedStep[]}
 */
export function resolveSteps(steps) {
  let searchWasPerformed = false;
  return steps.flatMap(
    /** @returns {ResolvedStep | ResolvedStep[]} */ (step) => {
      if (step.name === 'searching') {
        searchWasPerformed = true;
        return resolveSearchingStep(step);
      }
      if (step.name === 'answering') {
        return {name: 'answering', status: step.status};
      }
      return {
        name: searchWasPerformed
          ? 'thinking-after-search'
          : 'thinking-before-search',
        status: step.status,
      };
    }
  );
}

/**
 * Resolves a searching step, expanding individual tool calls when present.
 * @param {GenerationStep} step
 * @returns {ResolvedStep[]}
 */
function resolveSearchingStep(step) {
  const searchToolCalls = step.toolCalls?.filter((tc) => tc.type === 'search');
  if (searchToolCalls?.length) {
    return searchToolCalls.map(resolveSearchToolCall);
  }
  return [{name: 'searching', status: step.status}];
}

/**
 * Resolves a single search tool call into a ResolvedStep.
 * @param {import("coveo").GenerationToolCall} toolCall
 * @returns {ResolvedStep}
 */
function resolveSearchToolCall(toolCall) {
  const query =
    toolCall.toolCallArgs && 'q' in toolCall.toolCallArgs
      ? toolCall.toolCallArgs.q
      : undefined;
  return query
    ? {
        name: 'searching-with-query',
        status: toolCall.status,
        searchQuery: query,
      }
    : {name: 'searching', status: toolCall.status};
}
