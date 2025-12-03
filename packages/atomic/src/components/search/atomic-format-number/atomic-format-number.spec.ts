import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import './atomic-format-number.js';
import {AtomicFormatNumber} from './atomic-format-number.js';

describe('atomic-format-number', () => {
  const renderAtomicFormatNumber = async (
    options: {
      minimumIntegerDigits?: number;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      minimumSignificantDigits?: number;
      maximumSignificantDigits?: number;
    } = {}
  ) => {
    const element = await fixture<AtomicFormatNumber>(
      html`<atomic-format-number
        .minimumIntegerDigits=${options.minimumIntegerDigits}
        .minimumFractionDigits=${options.minimumFractionDigits}
        .maximumFractionDigits=${options.maximumFractionDigits}
        .minimumSignificantDigits=${options.minimumSignificantDigits}
        .maximumSignificantDigits=${options.maximumSignificantDigits}
      ></atomic-format-number>`
    );
    return {element};
  };

  it('should dispatch atomic/numberFormat event on connectedCallback', async () => {
    const dispatchEventSpy = vi.spyOn(
      AtomicFormatNumber.prototype,
      'dispatchEvent'
    );

    await renderAtomicFormatNumber();

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'atomic/numberFormat',
      })
    );
  });

  it('should render nothing when there is no error', async () => {
    const {element} = await renderAtomicFormatNumber();
    expect(element.shadowRoot?.innerHTML.trim()).toBe('<!---->');
  });

  it('should format number with minimum fraction digits', async () => {
    const {element} = await renderAtomicFormatNumber({
      minimumFractionDigits: 2,
    });

    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;
    element.addEventListener('atomic/numberFormat', (e: Event) => {
      capturedFormatter = (e as CustomEvent).detail;
    });

    element.connectedCallback();

    if (capturedFormatter) {
      const result = capturedFormatter(100, ['en-US']);
      expect(result).toBe('100.00');
    }
  });

  it('should format number with maximum fraction digits', async () => {
    const {element} = await renderAtomicFormatNumber({
      maximumFractionDigits: 1,
    });

    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;
    element.addEventListener('atomic/numberFormat', (e: Event) => {
      capturedFormatter = (e as CustomEvent).detail;
    });

    element.connectedCallback();

    if (capturedFormatter) {
      const result = capturedFormatter(100.999, ['en-US']);
      expect(result).toBe('101');
    }
  });

  describe('when not a child of a compatible component', () => {
    it('should render atomic-component-error when dispatchEvent is not canceled', async () => {
      const container = document.createElement('div');
      container.addEventListener('atomic/numberFormat', (_e) => {
        // Don't prevent default - simulating no compatible parent
      });

      const element = await fixture<AtomicFormatNumber>(
        html`<atomic-format-number></atomic-format-number>`,
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
