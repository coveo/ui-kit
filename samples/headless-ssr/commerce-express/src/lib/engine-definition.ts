import {defineCommerceEngine} from '@coveo/headless/ssr-commerce-next';
import {engineConfig} from './engine-config.js';

const engineDefinition = defineCommerceEngine(engineConfig);

export const {searchEngineDefinition} = engineDefinition;
