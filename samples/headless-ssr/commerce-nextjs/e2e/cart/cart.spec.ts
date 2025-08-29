import {expect, test} from './cart.fixture';

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

      expect(cartItemsCount).toBe(3);
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

      await expect
        .poll(async () => {
          return parseInt(
            (await (await cart.getItemQuantity(item)).textContent()) || ''
          );
        })
        .toBe(initialItemQuantity + 1);
    });

    test('should increase the total price', async ({cart}) => {
      const item = cart.items.first();

      await expect
        .poll(async () => {
          return parseInt(
            (await (await cart.getItemTotalPrice(item)).textContent()) || ''
          );
        })
        .toBe(initialItemPrice * (initialItemQuantity + 1));
    });

    test('should increase the cart total', async ({cart}) => {
      await expect
        .poll(async () => {
          const total = parseInt((await cart.total.textContent()) || '');
          return total;
        })
        .toBe(initialCartTotal + initialItemPrice);
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

        await expect
          .poll(async () => {
            const quantity = parseInt(
              (await (await cart.getItemQuantity(item)).textContent()) || ''
            );
            return quantity;
          })
          .toBe(initialItemQuantity - 1);
      });

      test('should decrease the total price', async ({cart}) => {
        const item = cart.items.nth(1);

        await expect
          .poll(async () => {
            const totalPrice = parseInt(
              (await (await cart.getItemTotalPrice(item)).textContent()) || ''
            );
            return totalPrice;
          })
          .toBe(initialItemPrice * (initialItemQuantity - 1));
      });

      test('should decrease the cart total', async ({cart}) => {
        await expect
          .poll(async () => {
            const total = parseInt((await cart.total.textContent()) || '');
            return total;
          })
          .toBe(initialCartTotal - initialItemPrice);
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
        await expect
          .poll(async () => {
            const cartItemsCount = await cart.items.count();
            return cartItemsCount;
          })
          .toBe(initialCartItemsCount - 1);
      });

      test('should decrease the cart total', async ({cart}) => {
        await expect
          .poll(async () => {
            const total = parseInt((await cart.total.textContent()) || '');
            return total;
          })
          .toBe(initialCartTotal - initialItemPrice * 1);
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
      await expect
        .poll(async () => {
          return await cart.items.count();
        })
        .toBe(initialCartItemsCount - 1);
    });
  });

  test.describe('when clicking the empty cart button', () => {
    test.beforeEach(async ({cart}) => {
      await cart.emptyCartButton.click();
    });

    test('should remove all items', async ({cart}) => {
      await expect
        .poll(async () => {
          return await cart.items.count();
        })
        .toBe(0);
    });

    test('should set the cart total to 0', async ({cart}) => {
      await expect
        .poll(async () => {
          const total = parseInt((await cart.total.textContent()) || '');
          return total;
        })
        .toBe(0);
    });
  });
});
