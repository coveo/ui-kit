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
    } = {},
    preventEventDefault = true
  ) => {
    const container = document.createElement('div');
    if (preventEventDefault) {
      container.addEventListener('atomic/numberFormat', (e) => {
        e.preventDefault();
      });
    }
    const element = await fixture<AtomicFormatNumber>(
      html`<atomic-format-number
        .minimumIntegerDigits=${options.minimumIntegerDigits}
        .minimumFractionDigits=${options.minimumFractionDigits}
        .maximumFractionDigits=${options.maximumFractionDigits}
        .minimumSignificantDigits=${options.minimumSignificantDigits}
        .maximumSignificantDigits=${options.maximumSignificantDigits}
      ></atomic-format-number>`,
      container
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
    const errorComponent = element.shadowRoot?.querySelector(
      'atomic-component-error'
    );
    expect(errorComponent).toBeNull();
  });

  it('should format number with minimum fraction digits', async () => {
    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;

    const container = document.createElement('div');
    container.addEventListener('atomic/numberFormat', (e) => {
      e.preventDefault();
      capturedFormatter = (e as CustomEvent).detail;
    });

    await fixture<AtomicFormatNumber>(
      html`<atomic-format-number
        .minimumFractionDigits=${2}
      ></atomic-format-number>`,
      container
    );

    expect(capturedFormatter).toBeDefined();
    if (capturedFormatter) {
      const result = capturedFormatter(100, ['en-US']);
      expect(result).toBe('100.00');
    }
  });

  it('should format number with maximum fraction digits', async () => {
    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;

    const container = document.createElement('div');
    container.addEventListener('atomic/numberFormat', (e) => {
      e.preventDefault();
      capturedFormatter = (e as CustomEvent).detail;
    });

    await fixture<AtomicFormatNumber>(
      html`<atomic-format-number
        .maximumFractionDigits=${1}
      ></atomic-format-number>`,
      container
    );

    expect(capturedFormatter).toBeDefined();
    if (capturedFormatter) {
      const result = capturedFormatter(100.999, ['en-US']);
      expect(result).toBe('101');
    }
  });

  it('should format number with minimum integer digits', async () => {
    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;

    const container = document.createElement('div');
    container.addEventListener('atomic/numberFormat', (e) => {
      e.preventDefault();
      capturedFormatter = (e as CustomEvent).detail;
    });

    await fixture<AtomicFormatNumber>(
      html`<atomic-format-number
        .minimumIntegerDigits=${4}
      ></atomic-format-number>`,
      container
    );

    expect(capturedFormatter).toBeDefined();
    if (capturedFormatter) {
      const result = capturedFormatter(42, ['en-US']);
      expect(result).toBe('0,042');
    }
  });

  it('should format number with minimum significant digits', async () => {
    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;

    const container = document.createElement('div');
    container.addEventListener('atomic/numberFormat', (e) => {
      e.preventDefault();
      capturedFormatter = (e as CustomEvent).detail;
    });

    await fixture<AtomicFormatNumber>(
      html`<atomic-format-number
        .minimumSignificantDigits=${4}
      ></atomic-format-number>`,
      container
    );

    expect(capturedFormatter).toBeDefined();
    if (capturedFormatter) {
      const result = capturedFormatter(42, ['en-US']);
      expect(result).toBe('42.00');
    }
  });

  it('should format number with maximum significant digits', async () => {
    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;

    const container = document.createElement('div');
    container.addEventListener('atomic/numberFormat', (e) => {
      e.preventDefault();
      capturedFormatter = (e as CustomEvent).detail;
    });

    await fixture<AtomicFormatNumber>(
      html`<atomic-format-number
        .maximumSignificantDigits=${2}
      ></atomic-format-number>`,
      container
    );

    expect(capturedFormatter).toBeDefined();
    if (capturedFormatter) {
      const result = capturedFormatter(12345, ['en-US']);
      expect(result).toBe('12,000');
    }
  });

  describe('when not a child of a compatible component', () => {
    it('should render atomic-component-error when dispatchEvent is not canceled', async () => {
      const {element} = await renderAtomicFormatNumber({}, false);

      await element.updateComplete;
      const errorComponent = element.shadowRoot?.querySelector(
        'atomic-component-error'
      );
      expect(errorComponent).toBeTruthy();
    });
  });
});
