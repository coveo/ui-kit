import {SolutionType} from '../commerce/types/controller-constants.js';

export class InvalidControllerDefinition extends Error {
  constructor() {
    super();
    this.name = 'InvalidControllerDefinition';
    this.message = `A controller must be defined for at least one solution type: ${Object.keys(
      SolutionType
    )
      .map((s) => s.toLowerCase())
      .join(', ')}`;
  }
}

export class MissingControllerProps extends Error {
  constructor(controller: string) {
    super();
    this.name = 'MissingControllerProps';
    this.message = `${controller} props are required but were undefined. Ensure they are included when calling \`fetchStaticState\` or \`hydrateStaticState\`.`;
    // + '\nSee [TODO: add link to fetchStaticState example] for more information.';
  }
}

export class MultipleRecommendationError extends Error {
  constructor(slotId: string) {
    super();
    this.name = 'MultipleRecommendationError';
    this.message = `Multiple recommendation controllers found for the same slotId: ${slotId}. Only one recommendation controller per slotId is supported.`;
  }
}
