import {describe, expect, it, vi} from 'vitest';
import './atomic-product-numeric-field-value';
import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {AtomicProductNumericFieldValue} from './atomic-product-numeric-field-value';

describe('atomic-product-numeric-field-value', () => {
  const renderProductNumericFieldValue = async (
    field = 'ec_rating',
    props: Partial<{
      currency?: string;
      minimumIntegerDigits?: number;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      minimumSignificantDigits?: number;
      maximumSignificantDigits?: number;
      unit?: string;
      unitDisplay?: 'long' | 'short' | 'narrow';
    }> = {}
  ) => {
    const {element} =
      await renderInAtomicProduct<AtomicProductNumericFieldValue>({
        template: html`<atomic-product-numeric-field-value
          field="${field}"
          currency=${ifDefined(props.currency)}
          minimum-integer-digits=${ifDefined(props.minimumIntegerDigits)}
          minimum-fraction-digits=${ifDefined(props.minimumFractionDigits)}
          maximum-fraction-digits=${ifDefined(props.maximumFractionDigits)}
          minimum-significant-digits=${ifDefined(
            props.minimumSignificantDigits
          )}
          maximum-significant-digits=${ifDefined(
            props.maximumSignificantDigits
          )}
          unit=${ifDefined(props.unit)}
          unit-display=${ifDefined(props.unitDisplay)}
        ></atomic-product-numeric-field-value>`,
        selector: 'atomic-product-numeric-field-value',
        product: buildFakeProduct(),
      });

    return {
      element,
    };
  };

  it('should add an event listener for atomic/numberFormat', async () => {
    const addEventListenerSpy = vi.spyOn(
      AtomicProductNumericFieldValue.prototype,
      'addEventListener'
    );
    await renderProductNumericFieldValue();
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'atomic/numberFormat',
      expect.any(Function)
    );
  });

  it('should remove the event listener for atomic/numberFormat on disconnect', async () => {
    const removeEventListenerSpy = vi.spyOn(
      AtomicProductNumericFieldValue.prototype,
      'removeEventListener'
    );
    const {element} = await renderProductNumericFieldValue();
    element.remove();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'atomic/numberFormat',
      expect.any(Function)
    );
  });

  it('should render nothing when the field value is null', async () => {
    const {element} =
      await renderProductNumericFieldValue('non_existent_field');
    expect(element).toHaveTextContent('');
  });

  it('should render the formatted value when the field value is present', async () => {
    const {element} = await renderProductNumericFieldValue();
    expect(element).toHaveTextContent('4.37');
  });

  describe('when using format properties', () => {
    it('should format currency when currency prop is set', async () => {
      const {element} = await renderProductNumericFieldValue('ec_rating', {
        currency: 'USD',
      });

      expect(element).toHaveTextContent('$4.37');
    });

    it('should format unit when unit prop is set', async () => {
      const {element} = await renderProductNumericFieldValue('ec_rating', {
        unit: 'kilogram',
        unitDisplay: 'long',
      });

      expect(element).toHaveTextContent('4.37 kilograms');
    });

    it('should apply minimumFractionDigits', async () => {
      const {element} = await renderProductNumericFieldValue('ec_rating', {
        minimumFractionDigits: 3,
      });

      expect(element).toHaveTextContent('4.370');
    });

    it('should apply maximumFractionDigits', async () => {
      const {element} = await renderProductNumericFieldValue('ec_rating', {
        maximumFractionDigits: 1,
      });

      expect(element).toHaveTextContent('4.4');
    });

    it('should combine currency with other format options', async () => {
      const {element} = await renderProductNumericFieldValue('ec_rating', {
        currency: 'EUR',
        minimumFractionDigits: 3,
      });

      expect(element.textContent).toContain('4.370');
    });

    it('should combine unit with other format options', async () => {
      const {element} = await renderProductNumericFieldValue('ec_rating', {
        unit: 'meter',
        maximumFractionDigits: 1,
      });

      expect(element).toHaveTextContent('4.4 m');
    });
  });
});
