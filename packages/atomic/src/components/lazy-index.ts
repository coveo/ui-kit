import CommerceComponentMap from './commerce/lazy-index.js';
import SearchComponentMap from './search/lazy-index.js';

export default {...SearchComponentMap, ...CommerceComponentMap};

export type * from './index.js';
