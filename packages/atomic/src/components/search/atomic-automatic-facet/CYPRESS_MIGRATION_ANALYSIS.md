# Cypress Test Analysis for atomic-automatic-facet

## Summary

This document categorizes the existing Cypress tests for `atomic-automatic-facet` and determines which tests are already covered by the new Vitest unit tests.

## Test Categorization

### Category A: Duplicated by Unit Test (Can be deleted)

The following Cypress tests are already covered by unit tests:

1. **verify rendering (lines 27-46)**
   - `assertContainsComponentError` → Covered by `should not set error when initialized correctly`
   - `assertDisplayFacet` → Covered by `should render the facet container`
   - `assertLabelIsNotEmpty` → Covered by `should render the facet label from state`
   - `assertDisplayValues` → Covered by `should render facet values`
   - `assertNumberOfSelectedCheckboxValues` → Covered by `should not display clear button when no values are selected`
   - `assertDisplayClearButton(false)` → Covered by `should not display clear button when no values are selected`

2. **verify label (lines 48-91)**
   - Testing with defined label → Covered by `should render the facet label from state`
   - Testing with undefined label → Covered by `should use field name when label is undefined`

3. **when selecting a value - verify rendering (lines 100-113)**
   - `assertDisplayClearButton(true)` → Covered by `should display clear button when values are selected`
   - `assertNumberOfSelectedCheckboxValues(1)` → Covered by `should call toggleSelect when a value is clicked`
   - `assertValueAtIndex` → Values rendering is covered by multiple tests

4. **when selecting a second value - verify rendering (lines 128-141)**
   - Similar to single value selection, covered by existing tests

5. **when selecting the "Clear" button - verify rendering (lines 155-167)**
   - `assertDisplayClearButton(false)` → Covered by unit tests
   - `assertNumberOfSelectedCheckboxValues(0)` → Covered by unit tests
   - `assertFocusHeader` → **MISSING** - Not covered by unit tests

### Category B: Duplicated by Playwright E2E Test (Can be deleted)

None - No Playwright E2E tests exist for this internal component (tested via generator).

### Category C: Should Become Unit Test

1. **Focus management after clear (line 166)**
   - `assertFocusHeader(AutomaticFacetSelectors)` - Tests that focus returns to header after clearing filters
   - **Action:** Add unit test to verify `focusTarget.focusAfterSearch()` is called

### Category D: Should Become E2E Test

1. **Analytics events (lines 115-119, 143-147, 169-173)**
   - `assertLogFacetSelect()` - Verifies analytics logging when selecting values
   - `assertLogClearFacetValues()` - Verifies analytics logging when clearing values
   - **Action:** These are integration concerns tested at the generator level, not component level

### Category E: Superfluous Test (Can be deleted)

1. **Accessibility tests (commented out, lines 30, 103, 131)**
   - Already commented out in Cypress
   - Accessibility should be tested in E2E tests for the generator component
   - Component-level accessibility is validated through proper ARIA attributes in unit tests

## Required Actions

### 1. Add Missing Unit Test Coverage

Add the following test to `atomic-automatic-facet.spec.ts`:

```typescript
describe('when clearing filters', () => {
  it('should focus header after clearing filters', async () => {
    const {element, facet} = await renderComponent({
      facetState: {
        values: [
          {
            value: 'selected_value',
            numberOfResults: 10,
            state: 'selected',
          },
        ],
      },
    });

    // Mock the focusAfterSearch method to verify it's called
    const focusAfterSearchSpy = vi.fn();
    element['headerFocus'] = {
      focusAfterSearch: focusAfterSearchSpy,
      setTarget: vi.fn(),
    } as any;

    const clearButton = element.shadowRoot?.querySelector('[part~="clear-button"]') as HTMLElement;
    await userEvent.click(clearButton);

    expect(focusAfterSearchSpy).toHaveBeenCalled();
  });
});
```

### 2. Delete Cypress Test Files

After confirming the missing unit test is added, delete the following files:
- `packages/atomic/cypress/e2e/facets/automatic-facet/automatic-facet.cypress.ts`
- `packages/atomic/cypress/e2e/facets/automatic-facet/automatic-facet-assertions.ts`
- `packages/atomic/cypress/e2e/facets/automatic-facet/automatic-facet-selectors.ts`

## Coverage Summary

- **Total Cypress tests:** ~12 distinct test scenarios
- **Covered by unit tests:** ~10 scenarios (83%)
- **Needs to be added to unit tests:** 1 scenario (focus management)
- **Analytics tests:** Should remain at generator/integration level
- **Accessibility tests:** Already commented out, tested at generator level

## Conclusion

The new Vitest unit tests provide comprehensive coverage of the `atomic-automatic-facet` component's functionality. Only one additional test (focus management) needs to be added before the Cypress tests can be safely removed.
