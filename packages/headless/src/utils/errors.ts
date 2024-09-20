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

export class DisconnectedError extends Error {
  public statusCode: number;
  constructor(url: string, statusCode?: number) {
    super();
    this.name = 'Disconnected';
    this.message = `Client could not connect to the following URL: ${url}`;
    this.statusCode = statusCode ?? 0;
  }
}
