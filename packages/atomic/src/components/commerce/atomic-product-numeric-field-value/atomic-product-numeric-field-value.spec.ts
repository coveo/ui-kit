import {describe, expect, it, vi} from 'vitest';
import './atomic-product-numeric-field-value';
import {html} from 'lit';
import {renderInAtomicProduct} from '@/vitest-utils/testing-helpers/fixtures/atomic/commerce/atomic-product-fixture';
import {buildFakeProduct} from '@/vitest-utils/testing-helpers/fixtures/headless/commerce/product';
import {AtomicProductNumericFieldValue} from './atomic-product-numeric-field-value';

describe('atomic-product-numeric-field-value', () => {
  const renderProductNumericFieldValue = async (field = 'ec_rating') => {
    const {element} =
      await renderInAtomicProduct<AtomicProductNumericFieldValue>({
        template: html`<atomic-product-numeric-field-value field="${field}"></atomic-product-numeric-field-value>`,
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
});
