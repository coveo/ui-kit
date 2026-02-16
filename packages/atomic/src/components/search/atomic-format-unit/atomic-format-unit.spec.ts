import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture.js';
import './atomic-format-unit.js';
import {AtomicFormatUnit} from './atomic-format-unit.js';

describe('atomic-format-unit', () => {
  const renderAtomicFormatUnit = async (
    unit = 'byte',
    unitDisplay: 'long' | 'short' | 'narrow' = 'short',
    preventEventDefault = true
  ) => {
    const container = document.createElement('div');
    if (preventEventDefault) {
      container.addEventListener('atomic/numberFormat', (e) => {
        e.preventDefault();
      });
    }
    const element = await fixture<AtomicFormatUnit>(
      html`<atomic-format-unit
        unit="${unit}"
        unit-display="${unitDisplay}"
      ></atomic-format-unit>`,
      container
    );
    return {element};
  };

  it('should dispatch atomic/numberFormat event on connectedCallback', async () => {
    const dispatchEventSpy = vi.spyOn(
      AtomicFormatUnit.prototype,
      'dispatchEvent'
    );

    await renderAtomicFormatUnit('byte');

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'atomic/numberFormat',
      })
    );
  });

  it('should render nothing when there is no error', async () => {
    const {element} = await renderAtomicFormatUnit();
    const errorComponent = element.shadowRoot?.querySelector(
      'atomic-component-error'
    );
    expect(errorComponent).toBeNull();
  });

  it('should format unit correctly with short display', async () => {
    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;

    const container = document.createElement('div');
    container.addEventListener('atomic/numberFormat', (e) => {
      e.preventDefault();
      capturedFormatter = (e as CustomEvent).detail;
    });

    await fixture<AtomicFormatUnit>(
      html`<atomic-format-unit
        unit="liter"
        unit-display="short"
      ></atomic-format-unit>`,
      container
    );

    expect(capturedFormatter).toBeDefined();
    if (capturedFormatter) {
      const result = capturedFormatter(16, ['en-US']);
      expect(result).toContain('16');
      expect(result.toLowerCase()).toContain('l');
    }
  });

  it('should format unit correctly with long display', async () => {
    let capturedFormatter:
      | ((value: number, languages: string[]) => string)
      | undefined;

    const container = document.createElement('div');
    container.addEventListener('atomic/numberFormat', (e) => {
      e.preventDefault();
      capturedFormatter = (e as CustomEvent).detail;
    });

    await fixture<AtomicFormatUnit>(
      html`<atomic-format-unit
        unit="liter"
        unit-display="long"
      ></atomic-format-unit>`,
      container
    );

    expect(capturedFormatter).toBeDefined();
    if (capturedFormatter) {
      const result = capturedFormatter(16, ['en-US']);
      expect(result).toContain('16');
      expect(result.toLowerCase()).toContain('liter');
    }
  });

  describe('when not a child of a compatible component', () => {
    it('should render atomic-component-error when dispatchEvent is not canceled', async () => {
      const {element} = await renderAtomicFormatUnit('byte', 'short', false);

      await element.updateComplete;
      const errorComponent = element.shadowRoot?.querySelector(
        'atomic-component-error'
      );
      expect(errorComponent).toBeTruthy();
    });
  });
});
