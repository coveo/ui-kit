/**
 * Thrown when a controller defined with props is built without them.
 *
 * @group Errors
 */
export class MissingControllerProps extends Error {
  constructor(controller: string) {
    super();
    this.name = 'MissingControllerProps';
    this.message = `${controller} props are required but were undefined. Pass them through the \`controllers\` option of \`fetchStaticState()\`; the returned static state carries them to \`hydrateStaticState()\`.`;
  }
}

/**
 * Thrown when two recommendation controllers of an engine definition target the same slot.
 *
 * @group Errors
 */
export class MultipleRecommendationError extends Error {
  constructor(slotId: string) {
    super();
    this.name = 'MultipleRecommendationError';
    this.message = `Multiple recommendation controllers found for the same slotId: ${slotId}. Only one recommendation controller per slotId is supported.`;
  }
}

/**
 * Thrown when a static state is hydrated with an engine definition other than the one that fetched it.
 *
 * @group Errors
 */
export class SolutionTypeMismatchError extends Error {
  constructor(expected: string, received: string) {
    super();
    this.name = 'SolutionTypeMismatchError';
    this.message = `This static state was fetched with the ${received} engine definition but is being hydrated with the ${expected} engine definition. Hydrate it with the \`${received}EngineDefinition\` that fetched it, and render it inside the matching provider.`;
  }
}
