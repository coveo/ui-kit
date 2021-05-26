import {Engine} from './headless-engine';

interface SearchEngine extends Engine {
  executeFirstSearch(): void;
}

export function buildSearchEngine(): SearchEngine {
  return {};
}
