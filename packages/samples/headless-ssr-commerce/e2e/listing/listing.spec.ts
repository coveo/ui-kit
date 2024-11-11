import {test, expect} from './listing.fixture';

test.describe('Listing Page', () => {
  test.beforeEach(async ({page}) => {
    await page.goto('/surf-accessories');
  });

  test('should load and display the search box', async ({search}) => {
    await expect(await search.searchBox()).toBeVisible();
  });

  test.describe('when entering a query', () => {
    test.beforeEach(async ({search}) => {
      const searchBox = await search.searchBox();
      await searchBox.fill('shoes');
    });

    test('should display suggestions', async ({search}) => {
      const suggestionsContainer = await search.getSuggestionsContainer();
      await expect(suggestionsContainer).toBeVisible();

      const suggestions = await search.getSuggestions();
      expect(await suggestions.count()).toBeGreaterThan(0);
    });

    test.describe('when clicking a suggestion', () => {
      let suggestionValue: string;
      test.beforeEach(async ({search}) => {
        const suggestions = await search.getSuggestions();
        suggestionValue =
          (await suggestions.first().textContent()) || 'no value found';
        await suggestions.first().click();
      });

      test('should go to search page', async ({page}) => {
        await page.waitForURL('**/search#q=*');

        const currentUrl = page.url();

        expect(currentUrl).toContain(suggestionValue);
      });
    });

    test.describe('when clicking search button', () => {
      test.beforeEach(async ({search}) => {
        (await search.getSearchButton()).click();
      });

      test('should go to search page', async ({page}) => {
        await page.waitForURL('**/search#q=*');
        const currentUrl = page.url();
        expect(currentUrl).toContain('shoes');
      });
    });
  });

  test.describe('Cart', () => {
    let initialItemQuantity: number;
    let initialItemPrice: number;
    let initialCartTotal: number;

    test('should display the cart', async ({cart}) => {
      const cartSection = await cart.getCart();
      await expect(cartSection).toBeVisible();
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
      test.beforeEach(async ({cart}) => {
        await (await cart.getAddOneButton()).first().click();

        const item = (await cart.getItems()).first();
        const quantity = parseInt(
          (await (await cart.getItemQuantity(item)).textContent()) || ''
        );

        expect(quantity).toBe(2);
      });

      test.describe('when initial quantity is bigger than 1', () => {
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

        test('should decrease the quantity', async ({cart}) => {
          const item = (await cart.getItems()).first();

          const quantity = parseInt(
            (await (await cart.getItemQuantity(item)).textContent()) || ''
          );

          expect(quantity).toBe(initialItemQuantity - 1);
        });

        test('should decrease the total price', async ({cart}) => {
          const item = (await cart.getItems()).first();

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

          expect(total).toBe(initialCartTotal - initialItemPrice * 2);
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
