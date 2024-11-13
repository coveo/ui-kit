import {JSDOM} from 'jsdom';
import {test, expect} from './cart.fixture';

const numItemsInCart = 0; // Define the numResults variable
const numItemsInCartMsg = `Items in cart: ${numItemsInCart}`;

test.describe('headless commerce ssr cart', () => {
  test(`renders page in SSR as expected`, async ({page}) => {
    const responsePromise = page.waitForResponse('**/cart');
    await page.goto('/cart');

    const response = await responsePromise;
    const responseBody = await response.text();

    const dom = new JSDOM(responseBody);

    expect(dom.window.document.querySelector('#cart-msg')?.textContent).toBe(
      numItemsInCartMsg
    );

    expect(dom.window.document.querySelectorAll('ul li').length).toBe(
      numItemsInCart
    );
    expect(
      (
        dom.window.document.querySelector(
          '#hydrated-indicator'
        ) as HTMLInputElement
      )?.checked
    ).toBe(false);
  });

  test(`renders page in CSR as expected`, async ({page, cart, hydrated}) => {
    await page.goto('/cart');
    await expect(hydrated.hydratedCartMessage).toHaveText(numItemsInCartMsg);

    expect(await cart.items.all()).toHaveLength(numItemsInCart);

    expect(await hydrated.hydratedIndicator).toBe(true);
  });

  test('renders product list in SSR and then in CSR', async ({
    page,
    cart,
    hydrated,
  }) => {
    const responsePromise = page.waitForResponse('**/cart');
    await page.goto('/cart');

    const response = await responsePromise;
    const responseBody = await response.text();

    const dom = new JSDOM(responseBody);

    const ssrTimestamp = Date.parse(
      dom.window.document.querySelector('#timestamp')!.textContent || ''
    );

    const hydratedTimestamp = Date.parse(
      (await hydrated.hydratedTimestamp.textContent()) || ''
    );

    expect(ssrTimestamp).not.toBeNaN();
    await expect(hydrated.hydratedCartMessage).toHaveText(numItemsInCartMsg);
    expect(await cart.items.all()).toHaveLength(numItemsInCart);
    expect(hydratedTimestamp).toBeGreaterThan(ssrTimestamp);
  });
});
