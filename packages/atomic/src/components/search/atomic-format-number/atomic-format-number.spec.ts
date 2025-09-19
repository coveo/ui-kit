import {html} from 'lit';
import {describe, expect, it, vi} from 'vitest';
import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {dispatchNumberFormatEvent} from '../../common/formats/format-common';
import {AtomicFormatNumber} from './atomic-format-number';
import '.';

vi.mock('../../common/formats/format-common', () => ({
  dispatchNumberFormatEvent: vi.fn(),
}));

describe('atomic-format-number', () => {
  const renderFormatNumber = async (
    props: {
      minimumIntegerDigits?: number;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
      minimumSignificantDigits?: number;
      maximumSignificantDigits?: number;
    } = {}
  ) => {
    const element = await fixture<AtomicFormatNumber>(
      html`<atomic-format-number
        .minimumIntegerDigits=${props.minimumIntegerDigits}
        .minimumFractionDigits=${props.minimumFractionDigits}
        .maximumFractionDigits=${props.maximumFractionDigits}
        .minimumSignificantDigits=${props.minimumSignificantDigits}
        .maximumSignificantDigits=${props.maximumSignificantDigits}
      ></atomic-format-number>`
    );

    const [formatter] = vi.mocked(dispatchNumberFormatEvent).mock.calls[0];

    return {element, formatter};
  };

  it('should call dispatchNumberFormatEvent on connection', async () => {
    await renderFormatNumber();

    expect(dispatchNumberFormatEvent).toHaveBeenCalledOnce();
    expect(dispatchNumberFormatEvent).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(AtomicFormatNumber)
    );
  });

  it('should render nothing when no error', async () => {
    const {element} = await renderFormatNumber();

    expect(element.shadowRoot?.textContent?.trim()).toBe('');
  });

  it('should render error component when error is set', async () => {
    const {element} = await renderFormatNumber();
    element.error = new Error('Test error');
    await element.updateComplete;

    const errorComponent = element.shadowRoot?.querySelector(
      'atomic-component-error'
    );
    expect(errorComponent).toBeInTheDocument();
  });

  it('should set error when dispatchNumberFormatEvent throws', async () => {
    const testError = new Error('Connection failed');
    vi.mocked(dispatchNumberFormatEvent).mockImplementation(() => {
      throw testError;
    });

    const element = await fixture<AtomicFormatNumber>(
      html`<atomic-format-number></atomic-format-number>`
    );

    expect(element.error).toBe(testError);
  });

  describe('formatter return values', () => {
    it('should format with default options', async () => {
      const {formatter} = await renderFormatNumber();

      expect(formatter(1234.56, ['en-US'])).toBe('1,234.56');
    });

    it('should format with minimumIntegerDigits', async () => {
      const {formatter} = await renderFormatNumber({minimumIntegerDigits: 4});

      expect(formatter(12, ['en-US'])).toBe('0,012');
    });

    it('should format with minimumFractionDigits', async () => {
      const {formatter} = await renderFormatNumber({minimumFractionDigits: 3});

      expect(formatter(123, ['en-US'])).toBe('123.000');
    });

    it('should format with maximumFractionDigits', async () => {
      const {formatter} = await renderFormatNumber({maximumFractionDigits: 1});

      expect(formatter(123.456, ['en-US'])).toBe('123.5');
    });

    it('should format with minimumSignificantDigits', async () => {
      const {formatter} = await renderFormatNumber({
        minimumSignificantDigits: 5,
      });

      expect(formatter(123, ['en-US'])).toBe('123.00');
    });

    it('should format with maximumSignificantDigits', async () => {
      const {formatter} = await renderFormatNumber({
        maximumSignificantDigits: 3,
      });

      expect(formatter(123456, ['en-US'])).toBe('123,000');
    });

    it('should format with multiple options', async () => {
      const {formatter} = await renderFormatNumber({
        minimumIntegerDigits: 2,
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      });

      expect(formatter(5.1, ['en-US'])).toBe('05.10');
    });

    it('should format with different locale', async () => {
      const {formatter} = await renderFormatNumber();

      expect(formatter(1234.56, ['de-DE'])).toBe('1.234,56');
    });
  });
});
