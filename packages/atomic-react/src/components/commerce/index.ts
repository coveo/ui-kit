export {CommerceBindings, i18n} from '@coveo/atomic';
export * from '../stencil-generated/commerce/index.js';
// Important: Re-exporting under the same name (eg: "AtomicCommerceInterface") shadows the original component
// and should wrap it nicely for users of the library
export {InterfaceWrapper as AtomicCommerceInterface} from './CommerceInterfaceWrapper.js';
export {ListWrapper as AtomicCommerceProductList} from './CommerceProductListWrapper.js';
export {InterfaceWrapper as AtomicCommerceRecommendationInterface} from './CommerceRecommendationInterfaceWrapper.js';
export {ListWrapper as AtomicCommerceRecommendationList} from './CommerceRecommendationListWrapper.js';
export * from './components.js';
