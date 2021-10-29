export const loadReducerError = new Error('Failed to load reducers.');

export class ExpiredTokenError extends Error {
  constructor() {
    super();
    this.name = 'ExpiredToken';
    this.message = 'The token being used to perform the request is expired.';
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
