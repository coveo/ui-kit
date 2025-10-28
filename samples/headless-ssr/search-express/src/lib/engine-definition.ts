import {defineSearchEngine} from '@coveo/headless/ssr-next';
import {engineConfig} from './engine-config.js';

export const searchEngineDefinition = defineSearchEngine(engineConfig);
