import {test, expect} from './fixture';
import {AtomicCommercePagerLocators} from './page-object';

// TODO: Move in shared E2E folder
export function should(should: boolean) {
  return should ? 'should' : 'should not';
}

export function assertAccessibility() {
  test('should be A11y compliant', async ({pager, makeAxeBuilder}) => {
    await pager.hydrated.waitFor();
    const accessibilityResults = await makeAxeBuilder().analyze();
    expect(accessibilityResults.violations).toEqual([]);
  });
}

export function assertEnabled(locator: keyof AtomicCommercePagerLocators) {
  test(`${locator} should be enabled`, async ({pager}) => {
    await expect(pager[locator]).toBeEnabled();
  });
}

export function assertDisabled(locator: keyof AtomicCommercePagerLocators) {
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
    const assertion = expect(pager.numericButtons.nth(pageNumber - 1));
    const expectation = selected
      ? assertion.toHaveAttribute('part', expect.stringContaining(part))
      : assertion.not.toHaveAttribute('part', part);

    await expectation;
  });
}
