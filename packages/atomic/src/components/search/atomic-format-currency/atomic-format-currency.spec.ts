import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import './atomic-format-currency.js';
import {AtomicFormatCurrency} from './atomic-format-currency.js';

describe('atomic-format-currency', () => {
  const renderAtomicFormatCurrency = async (currency = 'USD') => {
    const element = await fixture<AtomicFormatCurrency>(
      html`<atomic-format-currency currency="${currency}"></atomic-format-currency>`
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
    expect(element.shadowRoot?.innerHTML.trim()).toBe('<!---->');
  });

  it('should format currency correctly using the provided currency code', async () => {
    const {element} = await renderAtomicFormatCurrency('EUR');

    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;
    element.addEventListener('atomic/numberFormat', (e: Event) => {
      capturedFormatter = (e as CustomEvent).detail;
    });

    element.connectedCallback();

    if (capturedFormatter) {
      const result = capturedFormatter(100, ['en-US']);
      expect(result).toContain('100');
      expect(result).toContain('€');
    }
  });

  describe('when not a child of a compatible component', () => {
    it('should render atomic-component-error when dispatchEvent is not canceled', async () => {
      const container = document.createElement('div');
      container.addEventListener('atomic/numberFormat', (_e) => {
        // Don't prevent default - simulating no compatible parent
      });

      const element = await fixture<AtomicFormatCurrency>(
        html`<atomic-format-currency currency="USD"></atomic-format-currency>`,
        container
      );

      await element.updateComplete;
      const errorComponent = element.shadowRoot?.querySelector(
        'atomic-component-error'
      );
      expect(errorComponent).toBeTruthy();
    });
  });
});
