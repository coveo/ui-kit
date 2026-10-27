import {expect, test, type Page, type Request} from '@playwright/test';

/** The view each converse request named in `context.custom.surfaceId`, in order. */
function trackViews(page: Page): string[] {
  const views: string[] = [];
  page.on('request', (request: Request) => {
    if (request.method() === 'POST' && request.url().includes('/converse-schema')) {
      views.push(request.postDataJSON().context.custom.surfaceId);
    }
  });
  return views;
}

/** The surface each search-view request asked the server to restore, in order. */
function trackRestores(page: Page): Array<string | undefined> {
  const restores: Array<string | undefined> = [];
  page.on('request', (request: Request) => {
    if (request.method() === 'POST' && request.url().includes('/converse-schema')) {
      const {context, message} = request.postDataJSON();
      if (context.custom.surfaceId === 'storefront-preview-search' && message) {
        restores.push(context.custom.restoreSurfaceId);
      }
    }
  });
  return restores;
}

/** The surface id the page's URL names. */
const surfaceInUrl = (page: Page) => new URL(page.url()).searchParams.get('surface');

async function search(page: Page, query: string, {ai}: {ai: boolean}) {
  await page.getByRole('checkbox', {name: 'AI'}).setChecked(ai);
  await page.getByRole('searchbox', {name: 'Search'}).fill(query);
  await page.getByRole('searchbox', {name: 'Search'}).press('Enter');
}

async function openListing(page: Page, name: string) {
  await page.getByRole('button', {name: /Listing pages/}).click();
  await page
    .getByRole('list', {name: 'Listing pages'})
    .getByRole('button', {name: new RegExp(name)})
    .click();
}

const page$ = (page: Page) => page.locator('main').first();

test.describe('Storefront Preview on one session', () => {
  test('opens on the home page without sending a request', async ({page}) => {
    const views = trackViews(page);
    await page.goto('/');

    await expect(page.getByRole('heading', {name: 'Home', level: 1})).toBeVisible();
    await expect(page.getByText(/stopped early/)).toHaveCount(0);
    expect(views).toEqual([]);
  });

  test('answers a search with AI on the assistant view', async ({page}) => {
    const views = trackViews(page);
    await page.goto('/');
    await search(page, 'which kayak should I get?', {ai: true});

    await expect(page.getByRole('heading', {name: 'which kayak should I get?'})).toBeVisible();
    await expect(page.getByRole('button', {name: 'See all kayaks'})).toBeVisible({timeout: 30000});
    await expect(page.getByRole('heading', {name: 'Kayaks', level: 3})).toBeVisible();
    await expect(page.getByText(/stopped early/)).toHaveCount(0);
    expect(views).toEqual(['storefront-preview-assistant']);
  });

  test('opens a follow-up as a new assistant answer', async ({page}) => {
    await page.goto('/');
    await search(page, 'which kayak should I get?', {ai: true});
    const followUp = page.getByRole('button', {name: 'Kayaks under $600'});
    await expect(followUp).toBeEnabled({timeout: 30000});

    await followUp.click();

    await expect(page.getByRole('heading', {name: 'Kayaks under $600', level: 1})).toBeVisible();
    await expect(
      page$(page)
        .getByRole('region', {name: /A2-UI surface/})
        .first()
    ).toBeVisible({
      timeout: 30000,
    });
  });

  test('adds a product to the cart', async ({page}) => {
    await page.goto('/');
    await search(page, 'which kayak should I get?', {ai: true});
    const addToCart = page.getByRole('button', {name: 'Add to cart, RiverRun Sit-On Kayak'});
    await expect(addToCart).toBeVisible({timeout: 30000});

    await addToCart.click();

    await expect(page.getByRole('button', {name: /Cart/})).toHaveText(/1/);
  });

  test('searches with AI off on the search view', async ({page}) => {
    const views = trackViews(page);
    await page.goto('/');
    await search(page, 'kayak', {ai: false});

    await expect(page.getByRole('heading', {name: 'Results for “kayak”'})).toBeVisible();
    const products = page.getByRole('list', {name: 'Product list'}).getByRole('listitem');
    await expect(products).toHaveCount(3, {timeout: 30000});
    await expect(page.getByText(/stopped early/)).toHaveCount(0);
    expect(views).toEqual(['storefront-preview-search']);
  });

  test('answers the search surface actions from the search the server keeps', async ({page}) => {
    await page.goto('/');
    await search(page, 'kayak', {ai: false});
    const products = page.getByRole('list', {name: 'Product list'}).getByRole('listitem');
    await expect(products).toHaveCount(3, {timeout: 30000});

    await page
      .getByRole('combobox', {name: 'Sort by:'})
      .selectOption({label: 'Price (High to Low)'});
    await expect(products.first().getByRole('heading')).toHaveText('LakeGlide Touring Kayak');

    await page.getByRole('checkbox', {name: /Dakine/}).check();
    await expect(products).toHaveCount(1);
    await expect(products.first().getByRole('heading')).toHaveText('RapidFin Whitewater Kayak');
  });

  test("searches a listing page's category on the search view", async ({page}) => {
    const views = trackViews(page);
    await page.goto('/');
    await openListing(page, 'Surfing');

    await expect(page.getByRole('heading', {name: 'Surfing', level: 1})).toBeVisible();
    await expect(page.getByRole('checkbox', {name: /Vissla/})).toBeVisible({timeout: 30000});
    await expect(page.getByText(/stopped early/)).toHaveCount(0);
    expect(views).toEqual(['storefront-preview-search']);
  });

  test('restores a listing as the server keeps it when the shopper goes back', async ({page}) => {
    const restores = trackRestores(page);
    await page.goto('/');
    await openListing(page, 'Surfing');
    // A product's badges are a nested list, so the products are counted by their names.
    const products = page.getByRole('list', {name: 'Product list'}).getByRole('heading');
    await page.getByRole('checkbox', {name: /Vissla/}).check({timeout: 30000});
    await expect(products).toHaveCount(2);
    await expect(page).toHaveURL(/\/listing\/surfing\?surface=ui-/);
    const listingSurface = surfaceInUrl(page);

    await search(page, 'kayak', {ai: false});
    await expect(products).toHaveCount(3, {timeout: 30000});
    await expect(page).toHaveURL(/\/search\?q=kayak&surface=ui-/);
    const searchSurface = surfaceInUrl(page);

    await page.goBack();

    await expect(page.getByRole('heading', {name: 'Surfing', level: 1})).toBeVisible();
    await expect(page.getByRole('checkbox', {name: /Vissla/})).toBeChecked({timeout: 30000});
    await expect(products).toHaveCount(2);
    expect(surfaceInUrl(page)).toBe(listingSurface);
    expect(restores.at(-1)).toBe(listingSurface);

    await page.goForward();

    await expect(page.getByRole('heading', {name: 'Results for “kayak”'})).toBeVisible();
    await expect(products).toHaveCount(3, {timeout: 30000});
    expect(surfaceInUrl(page)).toBe(searchSurface);
    expect(restores.at(-1)).toBe(searchSurface);

    await page.goBack();

    await expect(page.getByRole('checkbox', {name: /Vissla/})).toBeChecked({timeout: 30000});
    await expect(products).toHaveCount(2);
    expect(surfaceInUrl(page)).toBe(listingSurface);
  });

  test('runs the listing search again for a surface the server no longer has', async ({page}) => {
    const restores = trackRestores(page);
    await page.goto('/listing/surfing?surface=ui-unknown');

    await expect(page.getByRole('checkbox', {name: /Vissla/})).toBeVisible({timeout: 30000});
    await expect(page).toHaveURL(/\/listing\/surfing\?surface=ui-/);
    expect(surfaceInUrl(page)).not.toBe('ui-unknown');
    expect(restores).toEqual(['ui-unknown']);
  });

  test('sends nothing for an assistant answer the shopper comes back to', async ({page}) => {
    const views = trackViews(page);
    await page.goto('/');
    await search(page, 'which kayak should I get?', {ai: true});
    await expect(page.getByRole('button', {name: 'Kayaks under $600'})).toBeEnabled({
      timeout: 30000,
    });
    await search(page, 'kayak', {ai: false});
    await expect(page.getByRole('heading', {name: 'Results for “kayak”'})).toBeVisible();
    const sent = views.length;

    await page.goBack();

    await expect(
      page.getByText(/Going back to an assistant answer isn't supported yet/)
    ).toBeVisible();
    expect(views).toHaveLength(sent);
  });

  test('opens the search behind a search option', async ({page}) => {
    await page.goto('/');
    await search(page, 'which kayak should I get?', {ai: true});
    const option = page.getByRole('button', {name: 'See all kayaks'});
    await expect(option).toBeEnabled({timeout: 30000});

    await option.click();

    await expect(page.getByRole('list', {name: 'Product list'}).getByRole('listitem')).toHaveCount(
      3,
      {timeout: 30000}
    );
  });
});
