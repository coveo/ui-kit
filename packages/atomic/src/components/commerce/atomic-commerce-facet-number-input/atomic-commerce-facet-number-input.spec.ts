import {renderInAtomicCommerceInterface} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-commerce-interface-fixture';
import {NumericFacet} from '@coveo/headless/commerce';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {describe, it, vi, expect} from 'vitest';
import {
  AtomicCommerceFacetNumberInput,
  Range,
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
        // TODO: add fixture
        state: {field: 'ec_price', facetId: 'test-facet'},
      } as unknown as NumericFacet);
    const {element} =
      await renderInAtomicCommerceInterface<AtomicCommerceFacetNumberInput>({
        template: html`<atomic-commerce-facet-number-input
          label=${props.label ?? 'Price'}
          .range=${props.range}
          .facet=${facet}
        ></atomic-commerce-facet-number-input>`,
        selector: 'atomic-commerce-facet-number-input',
      });

    // const element = await renderFunctionFixture(
    //   html`<atomic-commerce-facet-number-input
    //     label=${props.label ?? 'Price'}
    //     .facet=${facet}
    //     .range=${props.range ?? {start: 0, end: 100}}
    //   ></atomic-commerce-facet-number-input>`
    // );

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
        return page.getByRole('form');
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

  it('is defined', () => {
    const el = document.createElement('atomic-commerce-facet-number-input');
    expect(el).toBeInstanceOf(AtomicCommerceFacetNumberInput);
  });

  it('should render the form with correct input and values', async () => {
    const {startInput, endInput} = await setupElement({
      range: {start: 10, end: 100},
    });

    await expect.element(startInput).toHaveValue(10);
    await expect.element(endInput).toHaveValue(100);
  });

  // TODO: useless
  // it.skip('should update start and end state on input', async () => {
  //   await setupElement({range: {start: 10, end: 100}});
  //   const {startInput, endInput} = locators;
  //   await startInput.fill('20');
  //   await endInput.fill('200');
  //   expect(element['start']).toBe(20);
  //   expect(element['end']).toBe(200);
  // });

  // TODO:
  // it.skip('should render empty input values when range is not provided', async () => {
  //   const {startInput, endInput} = locators;
  //   await expect.element(startInput).toHaveValue('');
  //   await expect.element(endInput).toHaveValue('');
  // });

  it('should render the form with part="input-form"', async () => {
    const {form} = await setupElement({range: {start: 10, end: 100}});
    await expect(form).toHaveAttribute('part', 'input-form');
  });

  it.skip('should render the label for start input with part="label-start"', async () => {
    const {minLabel} = await setupElement({range: {start: 10, end: 100}});
    await expect(minLabel).toHaveAttribute('part', 'label-start');
  });

  it.skip('should render the start input with part="input-start"', async () => {
    const {startInput} = await setupElement({range: {start: 10, end: 100}});
    await expect(startInput).toHaveAttribute('part', 'input-start');
  });

  it.skip('should render the end input with part="input-end"', async () => {
    const {endInput} = await setupElement({range: {start: 10, end: 100}});
    await expect(endInput).toHaveAttribute('part', 'input-end');
  });

  it.skip('should render the label for end input with part="label-end"', async () => {
    const {maxLabel} = await setupElement({range: {start: 10, end: 100}});
    await expect(maxLabel).toHaveAttribute('part', 'label-end');
  });

  it.skip('should render the apply button with part="input-apply-button"', async () => {
    const {applyButton} = await setupElement({range: {start: 10, end: 100}});
    await expect(applyButton).toHaveAttribute('part', 'input-apply-button');
  });

  describe('#apply', () => {
    it.skip('should emit atomic-number-input-apply event with correct detail button is clicked', async () => {
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

    it.skip('should not emit event if inputs are invalid', async () => {
      const {element, applyButton} = await setupElement({
        range: {start: 10, end: 100},
      });
      const spy = vi.fn();
      element.addEventListener('atomic-number-input-apply', spy);

      element['startRef'] = {validity: {valid: false}} as HTMLInputElement;
      element['endRef'] = {validity: {valid: false}} as HTMLInputElement;

      await applyButton.click();
      expect(spy).not.toHaveBeenCalled();
    });

    it.skip('should set the appropriate start and end refs', async () => {
      const {element, startInput, endInput} = await setupElement({
        range: {start: 10, end: 100},
      });

      expect(element['startRef']).toBe(startInput);
      expect(element['endRef']).toBe(endInput);
    });
  });
});
