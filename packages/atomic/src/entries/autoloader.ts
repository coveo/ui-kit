import {registerAutoloader} from '../autoloader/index.js';

registerAutoloader();

export * as CommerceComponentMap from '@/src/components/commerce/lazy-index.js';
export * as CommonComponentMap from '@/src/components/common/lazy-index.js';
export * as SearchComponentMap from '@/src/components/search/lazy-index.js';

export * from './version.js';
