import type {NumericFilter, NumericFilterState} from '@coveo/headless';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicSearchInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/search/atomic-search-interface-fixture';
import {AtomicFacetNumberInput} from './atomic-facet-number-input';
import './atomic-facet-number-input';

describe('atomic-facet-number-input', () => {
  let filter: NumericFilter;

  const locators = {
    minLabel: page.getByText('Min'),
    maxLabel: page.getByText('Max'),
    applyButton: page.getByRole('button', {name: /Apply/}),
    parts: (element: AtomicFacetNumberInput) => ({
      form: element.querySelector('[part="input-form"]')!,
      startInput: element.querySelector(
        '[part="input-start"]'
      )! as HTMLInputElement,
      endInput: element.querySelector(
        '[part="input-end"]'
      )! as HTMLInputElement,
      startLabel: element.querySelector('[part="label-start"]')!,
      endLabel: element.querySelector('[part="label-end"]')!,
      applyButton: element.querySelector('[part="input-apply-button"]')!,
    }),
  };

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

    return {element};
  };

  it('should be defined', async () => {
    const {element} = await setupElement();
    expect(element).toBeInstanceOf(AtomicFacetNumberInput);
  });

  it('should render the form with correct input and values', async () => {
    const {element} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });
    const parts = locators.parts(element);

    expect(parts.startInput.value).toBe('10');
    expect(parts.endInput.value).toBe('100');
  });

  it('should render empty input values when range is not provided', async () => {
    const {element} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: undefined,
      } as NumericFilterState,
    });
    const parts = locators.parts(element);

    expect(parts.startInput.value).toBe('');
    expect(parts.endInput.value).toBe('');
  });

  it('should render the form with part="input-form"', async () => {
    const {element} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });
    const parts = locators.parts(element);

    expect(parts.form).toBeInTheDocument();
  });

  it('should render the label for start input with part="label-start"', async () => {
    await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });

    await expect.element(locators.minLabel).toBeInTheDocument();
  });

  it('should render the start input with part="input-start"', async () => {
    const {element} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });
    const parts = locators.parts(element);

    expect(parts.startInput.getAttribute('part')).toBe('input-start');
  });

  it('should render the end input with part="input-end"', async () => {
    const {element} = await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });
    const parts = locators.parts(element);

    expect(parts.endInput.getAttribute('part')).toBe('input-end');
  });

  it('should render the label for end input with part="label-end"', async () => {
    await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });

    await expect.element(locators.maxLabel).toBeInTheDocument();
  });

  it('should render the apply button with part="input-apply-button"', async () => {
    await setupElement({
      filterState: {
        facetId: 'test-facet',
        range: {start: 10, end: 100},
      } as NumericFilterState,
    });

    await expect.element(locators.applyButton).toBeInTheDocument();
  });

  it('should render step="1" for integer type', async () => {
    const {element} = await setupElement({
      type: 'integer',
    });
    const parts = locators.parts(element);

    expect(parts.startInput.getAttribute('step')).toBe('1');
  });

  it('should render step="any" for decimal type', async () => {
    const {element} = await setupElement({
      type: 'decimal',
    });
    const parts = locators.parts(element);

    expect(parts.startInput.getAttribute('step')).toBe('any');
  });

  describe('when the apply button is clicked', () => {
    it('should emit atomic/numberInputApply event', async () => {
      const {element} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: {start: 10, end: 100},
        } as NumericFilterState,
      });
      const spy = vi.fn();
      element.addEventListener('atomic/numberInputApply', spy);
      await locators.applyButton.click();
      expect(spy).toHaveBeenCalled();
    });

    it('should call filter.setRange with correct values', async () => {
      await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: {start: 10, end: 100},
        } as NumericFilterState,
      });
      await locators.applyButton.click();
      expect(filter.setRange).toHaveBeenCalledWith({
        start: 10,
        end: 100,
      });
    });

    it('should call filter.setRange with updated values when inputs are changed', async () => {
      const {element} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: {start: 10, end: 100},
        } as NumericFilterState,
      });
      const parts = locators.parts(element);

      parts.startInput.value = '50';
      parts.endInput.value = '200';
      parts.startInput.dispatchEvent(new Event('input', {bubbles: true}));
      parts.endInput.dispatchEvent(new Event('input', {bubbles: true}));
      await locators.applyButton.click();

      expect(filter.setRange).toHaveBeenCalledWith({
        start: 50,
        end: 200,
      });
    });
  });

  describe('when invalid input is entered', () => {
    it('should not call filter.setRange when start input is empty', async () => {
      const {element} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: undefined,
        } as NumericFilterState,
      });
      const parts = locators.parts(element);

      parts.endInput.value = '100';
      parts.endInput.dispatchEvent(new Event('input', {bubbles: true}));
      await locators.applyButton.click();

      expect(parts.startInput.validity.valid).toBe(false);
      expect(parts.startInput.validity.valueMissing).toBe(true);
      expect(filter.setRange).not.toHaveBeenCalled();
    });

    it('should not call filter.setRange when end input is empty', async () => {
      const {element} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: undefined,
        } as NumericFilterState,
      });
      const parts = locators.parts(element);

      parts.startInput.value = '10';
      parts.startInput.dispatchEvent(new Event('input', {bubbles: true}));
      await locators.applyButton.click();

      expect(parts.endInput.validity.valid).toBe(false);
      expect(parts.endInput.validity.valueMissing).toBe(true);
      expect(filter.setRange).not.toHaveBeenCalled();
    });

    it('should not call filter.setRange when start value is greater than end value', async () => {
      const {element} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: {start: 10, end: 100},
        } as NumericFilterState,
      });
      const parts = locators.parts(element);

      parts.startInput.value = '200';
      parts.endInput.value = '100';
      parts.startInput.dispatchEvent(new Event('input', {bubbles: true}));
      parts.endInput.dispatchEvent(new Event('input', {bubbles: true}));
      await locators.applyButton.click();

      expect(parts.startInput.validity.valid).toBe(false);
      expect(parts.startInput.validity.rangeOverflow).toBe(true);
      expect(filter.setRange).not.toHaveBeenCalled();
    });

    it('should not emit atomic/numberInputApply event when inputs are invalid', async () => {
      const {element} = await setupElement({
        filterState: {
          facetId: 'test-facet',
          range: undefined,
        } as NumericFilterState,
      });
      const parts = locators.parts(element);
      const spy = vi.fn();
      element.addEventListener('atomic/numberInputApply', spy);
      await locators.applyButton.click();

      expect(parts.startInput.validity.valid).toBe(false);
      expect(parts.endInput.validity.valid).toBe(false);
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
