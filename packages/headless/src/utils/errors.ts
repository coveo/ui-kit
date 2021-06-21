export const loadReducerError = new Error('Failed to load reducers.');

export class ExpiredTokenError extends Error {
  constructor() {
    super();
    this.name = 'ExpiredToken';
    this.message = 'The token being used to perform the request is expired.';
  }
}

export class DisconnectedError extends Error {
  constructor() {
    super();
    this.name = 'Disconnected';
    this.message = 'Client is not connected to the internet.';
  }
}
