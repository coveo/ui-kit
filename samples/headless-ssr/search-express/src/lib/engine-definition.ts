import {defineSearchEngine} from '@coveo/headless/ssr-next';
import {engineConfig} from './engine-config.js';

// Create the search engine definition
// This is used by both server.ts (for SSR) and client.ts (for hydration)
export const {searchEngineDefinition} = defineSearchEngine(engineConfig);
