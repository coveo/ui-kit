import {test, expect} from './cart.fixture';

test.describe('Cart Page', () => {
  test.beforeEach(async ({page, context}) => {
    await context.addCookies([
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
    ]);

    await page.goto('/cart');
  });

  test.describe('Cart', () => {
    let initialItemQuantity: number;
    let initialItemPrice: number;
    let initialCartTotal: number;

    test('should display the cart', async ({cart}) => {
      const cartSection = await cart.getCart();
      await expect(cartSection).toBeVisible();
    });

    test.describe('when adding a new item to the cart', () => {
      test.beforeEach(async ({page, cart}) => {
        await page.goto('/toys');

        await (await cart.getAddToCartButton()).first().click();
      });

      test('should add the item to the cart', async ({cart, page}) => {
        await page.goto('/cart');

        const cartItemsCount = await (await cart.getItems()).count();

        expect(cartItemsCount).toBe(4);
      });
    });

    test.describe('when increasing the quantity of an item', () => {
      test.beforeEach(async ({cart}) => {
        const item = (await cart.getItems()).first();

        initialItemQuantity = parseInt(
          (await (await cart.getItemQuantity(item)).textContent()) || ''
        );
        initialItemPrice = parseInt(
          (await (await cart.getItemPrice(item)).textContent()) || ''
        );
        initialCartTotal = parseInt(
          (await (await cart.getTotal()).textContent()) || ''
        );

        await (await cart.getAddOneButton()).first().click();
      });

      test('should increase the quantity', async ({cart}) => {
        const item = (await cart.getItems()).first();

        const quantity = parseInt(
          (await (await cart.getItemQuantity(item)).textContent()) || ''
        );

        expect(quantity).toBe(initialItemQuantity + 1);
      });

      test('should increase the total price', async ({cart}) => {
        const item = (await cart.getItems()).first();

        const totalPrice = parseInt(
          (await (await cart.getItemTotalPrice(item)).textContent()) || ''
        );

        expect(totalPrice).toBe(initialItemPrice * (initialItemQuantity + 1));
      });

      test('should increase the cart total', async ({cart}) => {
        const total = parseInt(
          (await (await cart.getTotal()).textContent()) || ''
        );

        expect(total).toBe(initialCartTotal + initialItemPrice);
      });
    });

    test.describe('when decreasing the quantity of an item', () => {
      test.describe('when initial quantity is bigger than 1', () => {
        let initialCartItemsCount: number;

        test.beforeEach(async ({cart}) => {
          const item = (await cart.getItems()).nth(1);

          await (await cart.getAddOneButton()).nth(1).click();

          initialItemQuantity = parseInt(
            (await (await cart.getItemQuantity(item)).textContent()) || ''
          );
          initialItemPrice = parseInt(
            (await (await cart.getItemPrice(item)).textContent()) || ''
          );
          initialCartTotal = parseInt(
            (await (await cart.getTotal()).textContent()) || ''
          );

          initialCartItemsCount = await (await cart.getItems()).count();

          await (await cart.getRemoveOneButton()).nth(1).click();
        });

        test('should decrease the quantity', async ({cart}) => {
          const item = (await cart.getItems()).nth(1);

          const quantity = parseInt(
            (await (await cart.getItemQuantity(item)).textContent()) || ''
          );

          expect(quantity).toBe(initialItemQuantity - 1);
        });

        test('should decrease the total price', async ({cart}) => {
          const item = (await cart.getItems()).nth(1);

          const totalPrice = parseInt(
            (await (await cart.getItemTotalPrice(item)).textContent()) || ''
          );

          expect(totalPrice).toBe(initialItemPrice * (initialItemQuantity - 1));
        });

        test('should decrease the cart total', async ({cart}) => {
          const total = parseInt(
            (await (await cart.getTotal()).textContent()) || ''
          );

          expect(total).toBe(initialCartTotal - initialItemPrice);
        });

        test('should not remove the item', async ({cart}) => {
          const cartItemsCount = await (await cart.getItems()).count();

          expect(cartItemsCount).toBe(initialCartItemsCount);
        });
      });

      test.describe('when initial quantity is 1', () => {
        let initialCartItemsCount: number;

        test.beforeEach(async ({cart}) => {
          const item = (await cart.getItems()).first();

          initialItemQuantity = parseInt(
            (await (await cart.getItemQuantity(item)).textContent()) || ''
          );
          initialItemPrice = parseInt(
            (await (await cart.getItemPrice(item)).textContent()) || ''
          );
          initialCartTotal = parseInt(
            (await (await cart.getTotal()).textContent()) || ''
          );

          initialCartItemsCount = await (await cart.getItems()).count();

          await (await cart.getRemoveOneButton()).first().click();
        });

        test('should remove the item', async ({cart}) => {
          const cartItemsCount = await (await cart.getItems()).count();

          expect(cartItemsCount).toBe(initialCartItemsCount - 1);
        });

        test('should decrease the cart total', async ({cart}) => {
          const total = parseInt(
            (await (await cart.getTotal()).textContent()) || ''
          );

          expect(total).toBe(initialCartTotal - initialItemPrice * 1);
        });
      });
    });

    test.describe('when clicking the remove all button on an item', () => {
      let initialCartItemsCount: number;
      test.beforeEach(async ({cart}) => {
        initialCartItemsCount = await (await cart.getItems()).count();

        await (await cart.getRemoveAllButton()).first().click();
      });

      test('should remove the item', async ({cart}) => {
        const cartItemsCount = await (await cart.getItems()).count();

        expect(cartItemsCount).toBe(initialCartItemsCount - 1);
      });
    });

    test.describe('when clicking the empty cart button', () => {
      test.beforeEach(async ({cart}) => {
        await (await cart.getEmptyCartButton()).click();
      });

      test('should remove all items', async ({cart}) => {
        const cartItemsCount = await (await cart.getItems()).count();

        expect(cartItemsCount).toBe(0);
      });

      test('should set the cart total to 0', async ({cart}) => {
        const total = parseInt(
          (await (await cart.getTotal()).textContent()) || ''
        );

        expect(total).toBe(0);
      });
    });
  });
});
