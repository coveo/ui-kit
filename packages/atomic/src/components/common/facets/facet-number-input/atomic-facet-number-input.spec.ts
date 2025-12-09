import type {NumericFilter, NumericFilterState} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {AtomicFacetNumberInput} from './atomic-facet-number-input';
import './atomic-facet-number-input';

describe('atomic-facet-number-input', () => {
  let filter: NumericFilter;

  const setupElement = async (
    props: Partial<{
      type: 'integer' | 'decimal';
      label: string;
      filter: NumericFilter;
      filterState: NumericFilterState;
    }> = {}
  ) => {
    const filterState =
      props.filterState ||
      ({facetId: 'test-facet', range: undefined} as NumericFilterState);

    filter =
      props.filter ||
      ({
        state: filterState,
        setRange: vi.fn(),
      } as unknown as NumericFilter);

    const {element} =
      await renderInAtomicSearchInterface<AtomicFacetNumberInput>({
        template: html`<atomic-facet-number-input
          type=${props.type ?? 'integer'}
          label=${props.label ?? 'Price'}
          .filter=${filter}
          .filterState=${filterState}
        ></atomic-facet-number-input>`,
        selector: 'atomic-facet-number-input',
      });

    return {
      element,
      get startInput() {
        return page.getByLabelText(
          'Enter a minimum numerical value for the Price facet'
        );
      },
      get endInput() {
        return page.getByLabelText(
          'Enter a maximum numerical value for the Price facet'
        );
      },
      get form() {
        return element.querySelector('form');
      },
      get applyButton() {
        return page.getByLabelText(
          'Apply custom numerical values for the Price facet'
        );
      },
      get minLabel() {
        return page.getByText('Min');
      },
      get maxLabel() {
        return page.getByText('Max');
      },
    };
  };

  it('should be defined', async () => {
    const {element} = await setupElement();
    expect(element).toBeInstanceOf(AtomicFacetNumberInput);
  });

  it('should render the form with correct input and values', async () => {
    const {startInput, endInput} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });

    await expect.element(startInput).toHaveValue(10);
    await expect.element(endInput).toHaveValue(100);
  });

  it('should render empty input values when range is not provided', async () => {
    const {startInput, endInput} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: undefined,
      } as NumericFilterState,
    });
    await expect.element(startInput).toHaveValue(null);
    await expect.element(endInput).toHaveValue(null);
  });

  it('should render the form with part="input-form"', async () => {
    const {form} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });
    expect(form).toHaveAttribute('part', 'input-form');
  });

  it('should render the label for start input with part="label-start"', async () => {
    const {minLabel} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });
    await expect(minLabel).toHaveAttribute('part', 'label-start');
  });

  it('should render the start input with part="input-start"', async () => {
    const {startInput} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });
    await expect.element(startInput).toHaveAttribute('part', 'input-start');
  });

  it('should render the end input with part="input-end"', async () => {
    const {endInput} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });
    await expect.element(endInput).toHaveAttribute('part', 'input-end');
  });

  it('should render the label for end input with part="label-end"', async () => {
    const {maxLabel} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });
    await expect(maxLabel).toHaveAttribute('part', 'label-end');
  });

  it('should render the apply button with part="input-apply-button"', async () => {
    const {applyButton} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });
    await expect
      .element(applyButton)
      .toHaveAttribute('part', 'input-apply-button');
  });

  it('should render step="1" for integer type', async () => {
    const {startInput} = await setupElement({
      type: 'integer',
    });
    await expect.element(startInput).toHaveAttribute('step', '1');
  });

  it('should render step="any" for decimal type', async () => {
    const {startInput} = await setupElement({
      type: 'decimal',
    });
    await expect.element(startInput).toHaveAttribute('step', 'any');
  });

  describe('when the apply button is clicked', () => {
    it('should emit atomic/numberInputApply event', async () => {
      const {element, applyButton} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: {start: 10, end: 100},
        } as NumericFilterState,
      });
      const spy = vi.fn();
      element.addEventListener('atomic/numberInputApply', spy);
      await applyButton.click();
      expect(spy).toHaveBeenCalled();
    });

    it('should call filter.setRange with correct values', async () => {
      const {applyButton} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: {start: 10, end: 100},
        } as NumericFilterState,
      });
      await applyButton.click();
      expect(filter.setRange).toHaveBeenCalledWith({
        start: 10,
        end: 100,
      });
    });

    it('should set the appropriate start and end refs', async () => {
      const {element, startInput, endInput} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: {start: 10, end: 100},
        } as NumericFilterState,
      });

      //@ts-expect-error: accessing private properties for testing
      expect(element.startRef).toBe(startInput.element());
      //@ts-expect-error: accessing private properties for testing
      expect(element.endRef).toBe(endInput.element());
    });

    it('should maintain valid refs when input values change', async () => {
      const {element, startInput, endInput} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: {start: 10, end: 100},
        } as NumericFilterState,
      });

      await startInput.fill('50');
      await endInput.fill('200');

      //@ts-expect-error: accessing private properties for testing
      expect(element.startRef).toBe(startInput.element());
      //@ts-expect-error: accessing private properties for testing
      expect(element.endRef).toBe(endInput.element());
    });

    it('should update ref values when input values change', async () => {
      const {element, startInput, endInput} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: {start: 10, end: 100},
        } as NumericFilterState,
      });

      await startInput.fill('50');
      await endInput.fill('200');

      //@ts-expect-error: accessing private properties for testing
      expect(element.startRef?.value).toBe('50');
      //@ts-expect-error: accessing private properties for testing
      expect(element.endRef?.value).toBe('200');
    });

    it('should call filter.setRange with updated values when inputs are changed', async () => {
      const {startInput, endInput, applyButton} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: {start: 10, end: 100},
        } as NumericFilterState,
      });

      await startInput.fill('50');
      await endInput.fill('200');
      await applyButton.click();

      expect(filter.setRange).toHaveBeenCalledWith({
        start: 50,
        end: 200,
      });
    });
  });
});
