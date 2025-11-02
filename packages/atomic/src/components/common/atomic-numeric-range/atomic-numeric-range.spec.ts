import {html} from 'lit';
import {describe, expect, it} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import type {AtomicNumericRange} from './atomic-numeric-range';
import './atomic-numeric-range';

describe('atomic-numeric-range', () => {
  const renderComponent = async ({
    label,
    start = 0,
    end = 100,
    endInclusive = false,
  }: {
    label?: string;
    start?: number;
    end?: number;
    endInclusive?: boolean;
  } = {}) => {
    const element = await fixture<AtomicNumericRange>(
      html`<atomic-numeric-range
        .label=${label}
        .start=${start}
        .end=${end}
        .endInclusive=${endInclusive}
      ></atomic-numeric-range>`
    );

    return {element};
  };

  it('should render with default properties', async () => {
    const {element} = await renderComponent();

    expect(element).toBeDefined();
    expect(element.start).toBe(0);
    expect(element.end).toBe(100);
    expect(element.endInclusive).toBe(false);
    expect(element.label).toBeUndefined();
  });

  it('should set start property', async () => {
    const {element} = await renderComponent({start: 50});

    expect(element.start).toBe(50);
  });

  it('should set end property', async () => {
    const {element} = await renderComponent({end: 200});

    expect(element.end).toBe(200);
  });

  it('should set endInclusive property', async () => {
    const {element} = await renderComponent({endInclusive: true});

    expect(element.endInclusive).toBe(true);
  });

  it('should set label property', async () => {
    const {element} = await renderComponent({label: 'Custom Label'});

    expect(element.label).toBe('Custom Label');
  });

  it('should reflect properties to attributes', async () => {
    const {element} = await renderComponent({
      start: 10,
      end: 90,
      endInclusive: true,
      label: 'Test',
    });

    expect(element.getAttribute('start')).toBe('10');
    expect(element.getAttribute('end')).toBe('90');
    expect(element.hasAttribute('endInclusive')).toBe(true);
    expect(element.getAttribute('label')).toBe('Test');
  });

  it('should use light DOM (no shadow root)', async () => {
    const {element} = await renderComponent();

    expect(element.shadowRoot).toBeNull();
  });
});
