import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import './atomic-format-currency.js';
import {AtomicFormatCurrency} from './atomic-format-currency.js';

describe('atomic-format-currency', () => {
  const renderAtomicFormatCurrency = async (
    currency = 'USD',
    preventEventDefault = true
  ) => {
    const container = document.createElement('div');
    if (preventEventDefault) {
      container.addEventListener('atomic/numberFormat', (e) => {
        e.preventDefault();
      });
    }
    const element = await fixture<AtomicFormatCurrency>(
      html`<atomic-format-currency
        currency="${currency}"
      ></atomic-format-currency>`,
      container
    );
    return {element};
  };

  it('should dispatch atomic/numberFormat event on connectedCallback', async () => {
    const dispatchEventSpy = vi.spyOn(
      AtomicFormatCurrency.prototype,
      'dispatchEvent'
    );

    await renderAtomicFormatCurrency('USD');

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'atomic/numberFormat',
      })
    );
  });

  it('should render nothing when there is no error', async () => {
    const {element} = await renderAtomicFormatCurrency('USD');
    const errorComponent = element.shadowRoot?.querySelector(
      'atomic-component-error'
    );
    expect(errorComponent).toBeNull();
  });

  it('should format currency correctly using the provided currency code', async () => {
    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;

    const container = document.createElement('div');
    container.addEventListener('atomic/numberFormat', (e) => {
      e.preventDefault();
      capturedFormatter = (e as CustomEvent).detail;
    });

    await fixture<AtomicFormatCurrency>(
      html`<atomic-format-currency currency="EUR"></atomic-format-currency>`,
      container
    );

    expect(capturedFormatter).toBeDefined();
    if (capturedFormatter) {
      const result = capturedFormatter(100, ['en-US']);
      expect(result).toContain('100');
      expect(result).toContain('€');
    }
  });

  describe('when not a child of a compatible component', () => {
    it('should render atomic-component-error when dispatchEvent is not canceled', async () => {
      const {element} = await renderAtomicFormatCurrency('USD', false);

      await element.updateComplete;
      const errorComponent = element.shadowRoot?.querySelector(
        'atomic-component-error'
      );
      expect(errorComponent).toBeTruthy();
    });
  });
});
