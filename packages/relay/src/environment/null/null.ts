import type {Environment} from '../environment.js';

export function buildNullEnvironment(): Environment {
  return {
    runtime: 'null',
    send: () => Promise.resolve(undefined),
    getReferrer: () => null,
    getLocation: () => null,
    getUserAgent: () => null,
    getClientId: () => '',
  };
}
