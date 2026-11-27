import {expect, test} from './fixtures';

const LISTING_ENDPOINT = /\/commerce\/v2\/listing$/;
const VISITOR_ID = '6c0ad7c8-3f7e-4d55-9d1b-5c1b8f0c2a11';

interface ListingRequestBody {
  clientId?: string;
  context: {capture?: boolean};
}

test.describe('listing navigator context', () => {
  test('sends the visitor ID set after the first client-side request', async ({page, context}) => {
    await page.goto('/listing/surf-accessories');
    const facetValues = page.locator('.FacetValueCheckbox');

    const requestWithoutVisitorId = page.waitForRequest(LISTING_ENDPOINT);
    await facetValues.nth(0).check();
    await requestWithoutVisitorId;

    await context.addCookies([
      {name: 'coveo_visitorId', value: VISITOR_ID, url: 'http://localhost:3000'},
    ]);

    const requestWithVisitorId = page.waitForRequest(LISTING_ENDPOINT);
    await facetValues.nth(1).check();
    const body: ListingRequestBody = (await requestWithVisitorId).postDataJSON();

    expect({clientId: body.clientId, capture: body.context.capture}).toEqual({
      clientId: VISITOR_ID,
      capture: true,
    });
  });
});
