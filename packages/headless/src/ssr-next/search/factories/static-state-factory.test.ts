// import type {Mock, MockInstance} from 'vitest';
// import {getSampleCommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
// import type {LoggerOptions} from '../../../app/logger.js';
// import {
//   buildProductListing,
//   type ProductListing,
// } from '../../../controllers/commerce/product-listing/headless-product-listing.js';
// import {
//   buildSearch,
//   type Search,
// } from '../../../controllers/commerce/search/headless-search.js';
// import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
// import {buildMockSSRCommerceEngine} from '../../../test/mock-engine-v2.js';
// import * as augmentModule from '../../common/augment-preprocess-request.js';
// import {defineSearchBox} from '../controllers/search-box/headless-search-box.ssr.js';
// import {fetchStaticStateFactory} from './static-state-factory.js';
// import {ControllerDefinitionsMap} from '../../common/types/controllers.js';
// import {CoreEngine} from '../../../app/engine.js';
// import {Controller} from '../../../controllers/controller/headless-controller.js';
// import {InferControllersMapFromDefinition} from '../../common/types/inference.js';
// import * as buildFactory from './build.js';

// vi.mock(
//   '../../../controllers/commerce/product-listing/headless-product-listing.js'
// );
// vi.mock('../../../controllers/commerce/search/headless-search.js');

// describe('fetchStaticStateFactory', () => {
//   let engineSpy: MockInstance;
//   const mockExecuteFirstRequest = vi.fn();
//   const mockedExecuteFirstSearch = vi.fn();
//   const mockEngine = buildMockSSRCommerceEngine(buildMockCommerceState());
//   const mockEngineOptions = {
//     configuration: getSampleCommerceEngineConfiguration(),
//   };

//   const definition = {
//     searchBox: defineSearchBox(),
//   };

//   beforeEach(async () => {
//     // TODO: clean that
//     engineSpy = vi.spyOn(buildFactory, 'buildFactory').mockReturnValue(
//       () => () =>
//         Promise.resolve({
//           engine: mockEngine,
//           controllers: {} as InferControllersMapFromDefinition<
//             ControllerDefinitionsMap<CoreEngine, Controller>
//           >,
//         })
//     );

//     mockExecuteFirstRequest.mockReturnValue(Promise.resolve());
//     mockedExecuteFirstSearch.mockReturnValue(Promise.resolve());
//     (mockEngine.waitForRequestCompletedAction as Mock).mockReturnValue([]);

//     await fetchStaticStateFactory(definition, mockEngineOptions)();
//   });

//   afterEach(() => {
//     vi.clearAllMocks();
//   });

//   it('should call buildFactory with the correct parameters', async () => {
//     await fetchStaticStateFactory(definition, mockEngineOptions)();
//     expect(engineSpy.mock.calls[0][0]).toStrictEqual(definition);
//   });

//   it('should call #augmentPreprocessRequestWithForwardedFor with the correct parameters', async () => {
//     const mockAugmentPreprocessRequest = vi.spyOn(
//       augmentModule,
//       'augmentPreprocessRequestWithForwardedFor'
//     );

//     const mockNavigatorContextProvider = vi.fn(); // TODO: check if can simply use vi.fn()
//     const mockPreprocessRequest = vi.fn(async (req) => req);
//     const options = {
//       configuration: {
//         ...getSampleCommerceEngineConfiguration(),
//         preprocessRequest: mockPreprocessRequest,
//       },
//       navigatorContextProvider: mockNavigatorContextProvider,
//       loggerOptions: {level: 'warn'} as LoggerOptions,
//     };

//     await fetchStaticStateFactory(definition, options)();
//     expect(mockAugmentPreprocessRequest).toHaveBeenCalledWith({
//       loggerOptions: {level: 'warn'},
//       navigatorContextProvider: mockNavigatorContextProvider,
//       preprocessRequest: mockPreprocessRequest,
//     });

//     mockAugmentPreprocessRequest.mockRestore();
//   });

//   it('should build a search controller', async () => {
//     expect(buildSearch).toHaveBeenCalledTimes(1);
//   });

//   it('should perform a search request ', async () => {
//     expect(mockedExecuteFirstSearch).toHaveBeenCalledTimes(1);
//   });

//   //TODO: should call createStaticState with the right parameters
//   //TODO: should return all controller with prop with the initialState property added to them
// });
