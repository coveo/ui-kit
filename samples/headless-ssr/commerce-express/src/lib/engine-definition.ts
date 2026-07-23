import {defineCommerceEngine} from '@coveo/headless/ssr-commerce';
import {engineConfig} from './engine-config.js';

const engineDefinition = defineCommerceEngine(engineConfig);

export const {searchEngineDefinition, listingEngineDefinition} = engineDefinition;
