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

async function search(page: Page, query: string, {ai}: {ai: boolean}) {
  await page.getByRole('checkbox', {name: 'AI'}).setChecked(ai);
  await page.getByRole('searchbox', {name: 'Search'}).fill(query);
  await page.getByRole('searchbox', {name: 'Search'}).press('Enter');
}

const page$ = (page: Page) => page.locator('main').first();

const panel$ = (page: Page) => page.getByRole('complementary', {name: 'Shopping assistant'});

async function askInPanel(page: Page, prompt: string) {
  await panel$(page).getByRole('textbox', {name: 'Ask the shopping assistant'}).fill(prompt);
  await panel$(page).getByRole('button', {name: 'Send'}).click();
}

async function openKayakSearch(page: Page) {
  await page.goto('/');
  await search(page, 'kayak', {ai: false});
  await expect(page.getByRole('heading', {name: 'Results for “kayak”'})).toBeVisible();
  await expect(products(page)).toHaveCount(3, {timeout: 30000});
}

const products = (page: Page) =>
  page
    .getByRole('region', {name: 'Search results'})
    .getByRole('list', {name: 'Product list'})
    .getByRole('listitem');

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

  test('keeps the search box disabled while an answer streams, so no search gets a conflict', async ({
    page,
  }) => {
    const views = trackViews(page);
    await page.goto('/');
    await search(page, 'kayak', {ai: true});
    const searchBox = page.getByRole('searchbox', {name: 'Search'});

    await expect(searchBox).toBeDisabled();
    await page.getByRole('checkbox', {name: 'AI'}).setChecked(false);
    await page.getByRole('search').evaluate((form: HTMLFormElement) => form.requestSubmit());

    await expect(searchBox).toBeEnabled({timeout: 30000});
    await expect(page.getByText(/stopped early/)).toHaveCount(0);
    expect(views).toEqual(['storefront-preview-assistant']);

    await search(page, 'boots', {ai: false});
    await expect(page.getByRole('heading', {name: 'Results for “boots”'})).toBeVisible();
    await expect(page.getByRole('list', {name: 'Product list'})).toBeVisible({timeout: 30000});
    await expect(page.getByText(/stopped early/)).toHaveCount(0);
    expect(views).toEqual(['storefront-preview-assistant', 'storefront-preview-search']);
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

  test('shows a listing page as in progress, without sending a request', async ({page}) => {
    const views = trackViews(page);
    await page.goto('/');

    await page.getByRole('button', {name: /Listing pages/}).click();
    await page
      .getByRole('list', {name: 'Listing pages'})
      .getByRole('button', {name: /Surfing/})
      .click();

    await expect(page.getByRole('status')).toContainText('In progress');
    expect(views).toEqual([]);
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

  test('answers in the chat panel from the search on screen, and keeps the results', async ({
    page,
  }) => {
    const views = trackViews(page);
    await openKayakSearch(page);
    const input = panel$(page).getByRole('textbox', {name: 'Ask the shopping assistant'});

    await askInPanel(page, 'which one is the cheapest?');

    await expect(input).toBeDisabled();
    await expect(page.getByRole('searchbox', {name: 'Search'})).toBeDisabled();
    await expect(panel$(page)).toContainText(
      'The cheapest of these results is the RiverRun Sit-On Kayak, at $549.99.',
      {timeout: 30000}
    );
    await expect(input).toBeEnabled();
    await panel$(page).getByText('Done.').click();
    await expect(panel$(page)).toContainText('The shopper is looking at the results for "kayak"');
    await expect(page.getByRole('heading', {name: 'Results for “kayak”'})).toBeVisible();
    await expect(products(page)).toHaveCount(3);

    await page.getByRole('checkbox', {name: /Dakine/}).check();
    await expect(products(page)).toHaveCount(1);
    await expect(products(page).first().getByRole('heading')).toHaveText(
      'RapidFin Whitewater Kayak'
    );

    await askInPanel(page, 'and now, which one is the cheapest?');
    await expect(panel$(page)).toContainText(
      'The cheapest of these results is the RapidFin Whitewater Kayak, at $749.99.',
      {timeout: 30000}
    );
    await expect(products(page)).toHaveCount(1);
    await expect(page.getByText(/stopped early/)).toHaveCount(0);
    expect(views).toEqual([
      'storefront-preview-search',
      'storefront-preview-assistant',
      'storefront-preview-search',
      'storefront-preview-assistant',
    ]);
  });

  test('keeps a follow-up of a panel answer in the panel', async ({page}) => {
    await openKayakSearch(page);
    await askInPanel(page, 'which kayak should I get?');
    const followUp = panel$(page).getByRole('button', {name: 'Kayaks under $600'});
    await expect(followUp).toBeEnabled({timeout: 30000});

    await followUp.click();

    const turns = panel$(page).locator('ol[aria-label="Conversation"] > li');
    await expect(turns).toHaveCount(2);
    await expect(turns.nth(1).getByText('Kayaks under $600', {exact: true})).toBeVisible();
    await expect(page.getByRole('heading', {name: 'Results for “kayak”'})).toBeVisible();
    await expect(products(page)).toHaveCount(3);
  });
});
