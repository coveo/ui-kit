import {JSDOM} from 'jsdom';
import {test, expect} from './cart.fixture';

test.describe('default', () => {
  const cartCookie = [
    {
      name: 'headless-cart',
      value: JSON.stringify([
        {
          name: 'Waxique Epoxy Wax',
          price: 33,
          productId: 'SP03973_00001',
          quantity: 1,
        },
        {
          name: 'Khaki Bottle',
          price: 16,
          productId: 'SP03929_00012',
          quantity: 2,
        },
        {
          name: 'Waxum Wax Package',
          price: 27,
          productId: 'SP03972_00001',
          quantity: 1,
        },
      ]),
      path: '/',
      domain: 'localhost',
    },
  ];

  test.beforeEach(async ({page, context}) => {
    await context.addCookies(cartCookie);
    await page.goto('/cart');
  });

  let initialItemQuantity: number;
  let initialItemPrice: number;
  let initialCartTotal: number;

  test('should display the cart', async ({cart}) => {
    const cartSection = cart.cart;
    await expect(cartSection).toBeVisible();
  });

  test.describe('when adding a new item to the cart', () => {
    test.beforeEach(async ({page, cart}) => {
      await page.goto('/toys');

      await cart.addToCartButton.first().click();
    });

    test('should add the item to the cart', async ({cart, page}) => {
      await page.goto('/cart');

      const cartItemsCount = await cart.items.count();

      expect(cartItemsCount).toBe(4);
    });
  });

  test.describe('when increasing the quantity of an item', () => {
    test.beforeEach(async ({cart}) => {
      const item = cart.items.first();

      initialItemQuantity = parseInt(
        (await (await cart.getItemQuantity(item)).textContent()) || ''
      );
      initialItemPrice = parseInt(
        (await (await cart.getItemPrice(item)).textContent()) || ''
      );
      initialCartTotal = parseInt((await cart.total.textContent()) || '');

      await cart.addOneButton.first().click();
    });

    test('should increase the quantity', async ({cart}) => {
      const item = cart.items.first();

      const quantity = parseInt(
        (await (await cart.getItemQuantity(item)).textContent()) || ''
      );

      expect(quantity).toBe(initialItemQuantity + 1);
    });

    test('should increase the total price', async ({cart}) => {
      const item = cart.items.first();

      const totalPrice = parseInt(
        (await (await cart.getItemTotalPrice(item)).textContent()) || ''
      );

      expect(totalPrice).toBe(initialItemPrice * (initialItemQuantity + 1));
    });

    test('should increase the cart total', async ({cart}) => {
      const total = parseInt((await cart.total.textContent()) || '');

      expect(total).toBe(initialCartTotal + initialItemPrice);
    });
  });

  test.describe('when decreasing the quantity of an item', () => {
    test.describe('when initial quantity is bigger than 1', () => {
      let initialCartItemsCount: number;

      test.beforeEach(async ({cart}) => {
        const item = cart.items.nth(1);

        initialItemQuantity = parseInt(
          (await (await cart.getItemQuantity(item)).textContent()) || ''
        );
        initialItemPrice = parseInt(
          (await (await cart.getItemPrice(item)).textContent()) || ''
        );
        initialCartTotal = parseInt((await cart.total.textContent()) || '');

        initialCartItemsCount = await cart.items.count();

        await cart.removeOneButton.nth(1).click();
      });

      test('should decrease the quantity', async ({cart}) => {
        const item = cart.items.nth(1);

        const quantity = parseInt(
          (await (await cart.getItemQuantity(item)).textContent()) || ''
        );

        expect(quantity).toBe(initialItemQuantity - 1);
      });

      test('should decrease the total price', async ({cart}) => {
        const item = cart.items.nth(1);

        const totalPrice = parseInt(
          (await (await cart.getItemTotalPrice(item)).textContent()) || ''
        );

        expect(totalPrice).toBe(initialItemPrice * (initialItemQuantity - 1));
      });

      test('should decrease the cart total', async ({cart}) => {
        const total = parseInt((await cart.total.textContent()) || '');

        expect(total).toBe(initialCartTotal - initialItemPrice);
      });

      test('should not remove the item', async ({cart}) => {
        const cartItemsCount = await cart.items.count();

        expect(cartItemsCount).toBe(initialCartItemsCount);
      });
    });

    test.describe('when initial quantity is 1', () => {
      let initialCartItemsCount: number;

      test.beforeEach(async ({cart}) => {
        const item = cart.items.first();

        initialItemQuantity = parseInt(
          (await (await cart.getItemQuantity(item)).textContent()) || ''
        );
        initialItemPrice = parseInt(
          (await (await cart.getItemPrice(item)).textContent()) || ''
        );
        initialCartTotal = parseInt((await cart.total.textContent()) || '');

        initialCartItemsCount = await cart.items.count();

        await cart.removeOneButton.first().click();
      });

      test('should remove the item', async ({cart}) => {
        const cartItemsCount = await cart.items.count();

        expect(cartItemsCount).toBe(initialCartItemsCount - 1);
      });

      test('should decrease the cart total', async ({cart}) => {
        const total = parseInt((await cart.total.textContent()) || '');

        expect(total).toBe(initialCartTotal - initialItemPrice * 1);
      });
    });
  });

  test.describe('when clicking the remove all button on an item', () => {
    let initialCartItemsCount: number;
    test.beforeEach(async ({cart}) => {
      initialCartItemsCount = await cart.items.count();

      await cart.removeAllButton.first().click();
    });

    test('should remove the item', async ({cart}) => {
      const cartItemsCount = await cart.items.count();

      expect(cartItemsCount).toBe(initialCartItemsCount - 1);
    });
  });

  test.describe('when clicking the empty cart button', () => {
    test.beforeEach(async ({cart}) => {
      await cart.emptyCartButton.click();
    });

    test('should remove all items', async ({cart}) => {
      const cartItemsCount = await cart.items.count();

      expect(cartItemsCount).toBe(0);
    });

    test('should set the cart total to 0', async ({cart}) => {
      const total = parseInt((await cart.total.textContent()) || '');

      expect(total).toBe(0);
    });
  });
});
test.describe('ssr', () => {
  const numItemsInCart = 0; // Define the numResults variable
  const numItemsInCartMsg = `Items in cart: ${numItemsInCart}`;

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
