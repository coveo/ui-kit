import {registerAutoloader} from '../atomic/autoloader/index.esm.js';

registerAutoloader();

export * as CommerceComponentMap from '../atomic/components/components/commerce/lazy-index.js';
export * as CommonComponentMap from '../atomic/components/components/common/lazy-index.js';
export * as InsightComponentMap from '../atomic/components/components/insight/lazy-index.js';
export * as IpxComponentMap from '../atomic/components/components/ipx/lazy-index.js';
export * as RecommendationsComponentMap from '../atomic/components/components/recommendations/lazy-index.js';
export * as SearchComponentMap from '../atomic/components/components/search/lazy-index.js';
export * from './_index.js';
