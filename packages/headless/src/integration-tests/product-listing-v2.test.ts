import {
    buildProductListingV2Engine, ProductListingV2Engine
} from '../app/product-listing-engine/product-listing-engine';
import {getOrganizationEndpoints} from '../api/platform-client';
import {waitForNextStateChange} from '../test/functional-test-utils';
import {buildPagerV2} from '../controllers/product-listing/pager/headless-product-listing-pager';
import {buildProductListingV2} from '../controllers/product-listing/headless-product-listing';
import {buildFacetsV2} from '../controllers/product-listing/facet/headless-product-listing-facet';

describe('product listing v2', () => {
    let engine: ProductListingV2Engine;
    beforeEach(async () => {
        const organizationEndpoints = getOrganizationEndpoints('saqdemo5fjlck8f', 'dev')
        engine = buildProductListingV2Engine({
            configuration: {
                organizationId: 'saqdemo5fjlck8f',
                accessToken: 'x9338f6e6-4566-43a7-b33c-ac9fdacacad0',
                organizationEndpoints: {
                    ...organizationEndpoints,
                    platform: `http://localhost:8100`,
                }
            }
        })
    })

    it('should work', async () => {
        const controller = buildProductListingV2(engine, {
            options: {
                id : 'some-listing-id',
                mode: 'live',
                locale: 'en'
            }
        })
        await waitForNextStateChange(controller, {
            action: () => controller.refresh(),
            expectedSubscriberCalls: 2,
        });
        expect(controller.state.responseId).not.toBeFalsy()
        expect(controller.state.products[0]).not.toEqual([])
        expect(controller.state.products[0].permanentid).toEqual("0001")
        expect(controller.state.listingId).toEqual("some-listing-id")
    })

    it('should support pagination', async () => {
        const productListingController = buildProductListingV2(engine, {
            options: {
                id : 'some-listing-id',
                mode: 'live',
                locale: 'en'
            }
        })
        const pagerController = buildPagerV2(engine)
        await waitForNextStateChange(productListingController, {
            action: () => productListingController.refresh(),
            expectedSubscriberCalls: 2,
        });

        expect(pagerController.state).toEqual({
            currentPage: 1,
            currentPages: [1, 2],
            hasNextPage: true,
            hasPreviousPage: false,
            maxPage: 2,
        })

        await waitForNextStateChange(pagerController, {
            action: () => pagerController.nextPage(),
            expectedSubscriberCalls: 1,
        });

        expect(pagerController.state).toEqual({
            currentPage: 2,
            currentPages: [1, 2],
            hasNextPage: false,
            hasPreviousPage: true,
            maxPage: 2,
        })
    })

    it('should support facets', async () => {
        const productListingController = buildProductListingV2(engine, {
            options: {
                id : 'some-listing-id',
                mode: 'live',
                locale: 'en'
            }
        })
        const facetsController = buildFacetsV2(engine)
        await waitForNextStateChange(productListingController, {
            action: () => productListingController.refresh(),
            expectedSubscriberCalls: 2,
        });

        expect(facetsController.state.facets).not.toEqual([])
    })
})
