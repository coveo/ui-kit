import CommerceComponentMap from './commerce/lazy-index.js';
import CommonComponentMap from './common/lazy-index.js';
import RecommendationsComponentMap from './recommendations/lazy-index.js';
import SearchComponentMap from './search/lazy-index.js';

export default {
  ...CommonComponentMap,
  ...RecommendationsComponentMap,
  ...CommerceComponentMap,
  ...SearchComponentMap,
};

export type * from './index.js';
