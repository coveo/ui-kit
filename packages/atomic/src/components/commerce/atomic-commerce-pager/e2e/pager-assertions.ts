import {test, expect} from './fixture';
import {AtomicCommercePagerLocators} from './page-object';

type NavigationButtons = keyof Pick<
  AtomicCommercePagerLocators,
  'nextButton' | 'previousButton'
>;

// TODO: Move in shared E2E folder
export function should(should: boolean) {
  return should ? 'should' : 'should not';
}

// TODO: Move in shared E2E folder
export function assertContainsComponentError(display: boolean) {
  test(`${should(display)} display an error component`, async ({pager}) => {
    const assertion = expect(pager.errorComponent);
    const expectation = display
      ? assertion.toBeVisible()
      : assertion.not.toBeVisible();
    await expectation;
  });
}

// TODO: Move in shared E2E folder
export function assertAccessibility() {
  test('should be A11y compliant', async ({pager, makeAxeBuilder}) => {
    await pager.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
}

export function assertEnabled(locator: NavigationButtons) {
  test(`${locator} should be enabled`, async ({pager}) => {
    await expect(pager[locator]).toBeEnabled();
  });
}

export function assertDisabled(locator: NavigationButtons) {
  test(`${locator} should be disabled`, async ({pager}) => {
    await expect(pager[locator]).toBeDisabled();
  });
}

export function assertPageInHash(currentPage: number) {
  const shouldInclude = currentPage > 1;
  const expectedHash = shouldInclude ? `#page=${currentPage - 1}` : '';

  test(`${should(shouldInclude)} include ${expectedHash} in the hash`, async ({
    page,
  }) => {
    await expect(page.url()).toContain(expectedHash);
  });
}

export function assertPagerSelected(pageNumber: number, selected: boolean) {
  test(`button ${pageNumber} ${should(selected)} be selected`, async ({
    pager,
  }) => {
    const part = 'active-page-button';
    const assertion = expect(pager.numericButton(pageNumber));
    const expectation = selected
      ? assertion.toHaveAttribute('part', expect.stringContaining(part))
      : assertion.not.toHaveAttribute('part', part);

    await expectation;
  });
}
