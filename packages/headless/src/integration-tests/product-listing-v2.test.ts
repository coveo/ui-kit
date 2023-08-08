import {
    buildProductListingV2Engine
} from '../app/product-listing-engine/product-listing-engine';
import {getOrganizationEndpoints} from '../api/platform-client';
import {buildProductListingV2} from '../controllers/product-listing/headless-product-listing';
import {waitForNextStateChange} from '../test/functional-test-utils';

describe('product listing v2', () => {
    it('should work', async () => {
        const organizationEndpoints = getOrganizationEndpoints('saqdemo5fjlck8f', 'dev')
        const engine = buildProductListingV2Engine({
            configuration: {
                organizationId: 'saqdemo5fjlck8f',
                accessToken: 'some access token',
                organizationEndpoints: {
                    ...organizationEndpoints,
                    platform: `http://localhost:8100`,
                }
            }
        })
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
})
