import {test, expect} from './fixture';

const SUMMARY_REGEX = ({
  indexOfFirstResult,
  indexOfLastResults,
  totalResults,
}: Record<string, number | undefined>) =>
  new RegExp(
    `Products ${indexOfFirstResult ?? '[\\d,]?'}-${indexOfLastResults ?? '[\\d,]?'} of ${totalResults ?? '[\\d,]?'}`
  );

test.describe('default', () => {
  test('should be A11Y compliant', async ({
    productsPerPage,
    makeAxeBuilder,
  }) => {
    await productsPerPage.load({story: 'in-a-page'});

    await productsPerPage.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();

    expect(accessibilityResults.violations).toEqual([]);
  });

  test('should execute the first query with the default number of products', async ({
    productsPerPage,
    querySummary,
  }) => {
    await productsPerPage.load({story: 'in-a-page'});

    await expect(
      querySummary
        .text(SUMMARY_REGEX({indexOfFirstResult: 1, indexOfLastResults: 10}))
        .first()
    ).toBeVisible();
  });

  test('should render the component with the number of products selected', async ({
    productsPerPage,
  }) => {
    await productsPerPage.load({story: 'in-a-page'});

    await productsPerPage.choice(25).click();

    await expect(productsPerPage.label().first()).toBeVisible();
    await expect(productsPerPage.choice(25)).toBeChecked();
  });

  test('should execute a query with the selected number of products', async ({
    productsPerPage,
    querySummary,
  }) => {
    await productsPerPage.load({story: 'in-a-page'});

    await productsPerPage.choice(25).click();

    await expect(
      querySummary.text(SUMMARY_REGEX({indexOfLastResults: 25})).first()
    ).toBeVisible();
  });

  test('should render correct choices when the choicesDisplayed prop is enabled', async ({
    productsPerPage,
  }) => {
    await productsPerPage.load({
      story: 'in-a-page-with-custom-choices-displayed',
    });

    await expect(productsPerPage.choice(2)).toBeVisible();
    await expect(productsPerPage.choice(2)).toBeChecked();
  });

  test('should not render correct choices when the choicesDisplayed prop is invalid', async ({
    productsPerPage,
  }) => {
    await productsPerPage.load({
      args: {choicesDisplayed: 'invalid'},
      story: 'in-a-page-with-custom-choices-displayed',
    });

    await expect(productsPerPage.error).toBeVisible();
  });

  test('should render the component with the initial choice selected', async ({
    productsPerPage,
  }) => {
    await productsPerPage.load({
      args: {initialChoice: 25},
      story: 'in-a-page',
    });

    await expect(productsPerPage.label().first()).toBeVisible();
    await expect(productsPerPage.choice(25)).toBeChecked();
  });

  test('should execute a query with the initial number of products', async ({
    productsPerPage,
    querySummary,
  }) => {
    await productsPerPage.load({
      args: {initialChoice: 25},
      story: 'in-a-page',
    });

    await expect(
      querySummary.text(SUMMARY_REGEX({indexOfLastResults: 25})).first()
    ).toBeVisible();
  });

  test('should not render the component if the initial choice is not in the list of choicesDisplayed', async ({
    productsPerPage,
  }) => {
    await productsPerPage.load({
      args: {initialChoice: 59},
      story: 'in-a-page',
    });

    await expect(productsPerPage.error).toBeVisible();
  });
});
