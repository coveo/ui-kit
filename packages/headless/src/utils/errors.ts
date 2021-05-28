export const loadReducerError = new Error('Failed to load reducers.');

export class ExpiredTokenError extends Error {
  constructor() {
    super();
    this.name = 'ExpiredToken';
  }
}
