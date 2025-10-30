import type {NumericFacet} from '@coveo/headless/commerce';
import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {page} from 'vitest/browser';
import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {
  AtomicCommerceFacetNumberInput,
  type Range,
} from './atomic-commerce-facet-number-input';
import './atomic-commerce-facet-number-input';

describe('atomic-commerce-facet-number-input', () => {
  let facet: NumericFacet;

  const setupElement = async (
    props: Partial<{
      label: string;
      range: Range;
      facet: NumericFacet;
    }> = {}
  ) => {
    facet =
      props.facet ||
      ({
        state: {field: 'ec_price', facetId: 'test-facet'},
      } as NumericFacet);
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceFacetNumberInput>({
        template: html`<atomic-commerce-facet-number-input
          label=${props.label ?? 'Price'}
          .range=${props.range}
          .facet=${facet}
        ></atomic-commerce-facet-number-input>`,
        selector: 'atomic-commerce-facet-number-input',
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
    expect(element).toBeInstanceOf(AtomicCommerceFacetNumberInput);
  });

  it('should render the form with correct input and values', async () => {
    const {startInput, endInput} = await setupElement({
      range: {start: 10, end: 100},
    });

    await expect.element(startInput).toHaveValue(10);
    await expect.element(endInput).toHaveValue(100);
  });

  it('should render empty input values when range is not provided', async () => {
    const {startInput, endInput} = await setupElement({range: undefined});
    await expect.element(startInput).toHaveValue(null);
    await expect.element(endInput).toHaveValue(null);
  });

  it('should render the form with part="input-form"', async () => {
    const {form} = await setupElement({range: {start: 10, end: 100}});
    await expect(form).toHaveAttribute('part', 'input-form');
  });

  it('should render the label for start input with part="label-start"', async () => {
    const {minLabel} = await setupElement({range: {start: 10, end: 100}});
    await expect(minLabel).toHaveAttribute('part', 'label-start');
  });

  it('should render the start input with part="input-start"', async () => {
    const {startInput} = await setupElement({range: {start: 10, end: 100}});
    await expect(startInput).toHaveAttribute('part', 'input-start');
  });

  it('should render the end input with part="input-end"', async () => {
    const {endInput} = await setupElement({range: {start: 10, end: 100}});
    await expect(endInput).toHaveAttribute('part', 'input-end');
  });

  it('should render the label for end input with part="label-end"', async () => {
    const {maxLabel} = await setupElement({range: {start: 10, end: 100}});
    await expect(maxLabel).toHaveAttribute('part', 'label-end');
  });

  it('should render the apply button with part="input-apply-button"', async () => {
    const {applyButton} = await setupElement({range: {start: 10, end: 100}});
    await expect(applyButton).toHaveAttribute('part', 'input-apply-button');
  });

  describe('when the apply button is clicked', () => {
    it('should emit atomic-number-input-apply event with correct detail', async () => {
      const {element, applyButton} = await setupElement({
        range: {start: 10, end: 100},
      });
      const spy = vi.fn();
      element.addEventListener('atomic-number-input-apply', spy);
      await applyButton.click();
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          detail: {start: 10, end: 100},
        })
      );
    });

    it('should set the appropriate start and end refs', async () => {
      const {element, startInput, endInput} = await setupElement({
        range: {start: 10, end: 100},
      });

      //@ts-expect-error: accessing private properties for testing
      expect(element.startRef).toBe(startInput.element());
      //@ts-expect-error: accessing private properties for testing
      expect(element.endRef).toBe(endInput.element());
    });

    it('should maintain valid refs when input values change', async () => {
      const {element, startInput, endInput} = await setupElement({
        range: {start: 10, end: 100},
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
        range: {start: 10, end: 100},
      });

      await startInput.fill('50');
      await endInput.fill('200');

      //@ts-expect-error: accessing private properties for testing
      expect(element.startRef?.value).toBe('50');
      //@ts-expect-error: accessing private properties for testing
      expect(element.endRef?.value).toBe('200');
    });
  });
});
