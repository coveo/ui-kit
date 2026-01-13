import CommerceComponentMap from './commerce/lazy-index.js';
import CommonComponentMap from './common/lazy-index.js';
import SearchComponentMap from './search/lazy-index.js';

export default {
  ...CommonComponentMap,
  ...CommerceComponentMap,
  ...SearchComponentMap,
};

export type * from './index.js';
