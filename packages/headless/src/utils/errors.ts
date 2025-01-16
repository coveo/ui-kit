import {SolutionType} from '../app/commerce-ssr-engine/types/common.js';

export const loadReducerError = new Error('Failed to load reducers.');

export class ExpiredTokenError extends Error {
  constructor() {
    super();
    this.name = 'ExpiredToken';
    this.message = 'The token being used to perform the request is expired.';
  }
}

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

export class DisconnectedError extends Error {
  public statusCode: number;
  constructor(url: string, statusCode?: number) {
    super();
    this.name = 'Disconnected';
    this.message = `Client could not connect to the following URL: ${url}`;
    this.statusCode = statusCode ?? 0;
  }
}
