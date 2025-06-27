import {NumberFormatter} from '@/src/components/common/formats/format-common';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import '@vitest/browser/matchers.d.ts';
import {
  vi,
  expect,
  describe,
  beforeAll,
  beforeEach,
  it,
  MockInstance,
  afterEach,
} from 'vitest';
import {
  formatHumanReadable,
  formatNumberLocalized,
  FormatFacetValueRange,
  FacetValueRange,
} from './formatter';

vi.mock('@/src/utils/field-utils', () => ({
  getFieldValueCaption: vi.fn(),
}));

describe('formatter', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  let mockLogger: Pick<Console, 'error'>;
  let mockFormatter: NumberFormatter;
  let mockedConsoleError: MockInstance;
  let defaultFormatProps: FormatFacetValueRange;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockLogger = {error: vi.fn()};
    mockFormatter = vi.fn().mockReturnValue('formatted-123');

    defaultFormatProps = {
      field: 'price',
      facetValue: {
        start: 10,
        end: 20,
        endInclusive: true,
        state: 'idle',
        numberOfResults: 42,
      },
      manualRanges: [],
      i18n,
      logger: mockLogger,
      formatter: mockFormatter,
    };

    vi.clearAllMocks();
  });

  afterEach(() => {
    mockedConsoleError.mockRestore();
  });

  describe('#formatHumanReadable', () => {
    it('should return manual range label when a matching manual range exists', () => {
      const manualRanges: FacetValueRange[] = [
        {
          start: 10,
          end: 20,
          endInclusive: true,
          state: 'idle',
          label: 'Budget Range',
        },
      ];

      vi.mocked(getFieldValueCaption).mockReturnValue('Budget Range Caption');

      const result = formatHumanReadable({
        ...defaultFormatProps,
        manualRanges,
      });

      expect(getFieldValueCaption).toHaveBeenCalledWith(
        'price',
        'Budget Range',
        i18n
      );
      expect(result).toBe('Budget Range Caption');
    });

    it('should return formatted range when no matching manual range exists', () => {
      const manualRanges: FacetValueRange[] = [
        {
          start: 50,
          end: 100,
          endInclusive: true,
          state: 'idle',
          label: 'Expensive Range',
        },
      ];

      const mockT = vi
        .spyOn(i18n, 't')
        .mockReturnValue('formatted-123 to formatted-123');

      const result = formatHumanReadable({
        ...defaultFormatProps,
        manualRanges,
      });

      expect(mockT).toHaveBeenCalledWith('to', {
        start: 'formatted-123',
        end: 'formatted-123',
      });
      expect(result).toBe('formatted-123 to formatted-123');

      mockT.mockRestore();
    });

    it('should return formatted range when manual ranges array is empty', () => {
      const mockT = vi.spyOn(i18n, 't').mockReturnValue('10 to 20');

      const result = formatHumanReadable(defaultFormatProps);

      expect(mockT).toHaveBeenCalledWith('to', {
        start: 'formatted-123',
        end: 'formatted-123',
      });
      expect(result).toBe('10 to 20');

      mockT.mockRestore();
    });

    it('should handle ranges with different endInclusive values', () => {
      const manualRanges: FacetValueRange[] = [
        {
          start: 10,
          end: 20,
          endInclusive: false,
          state: 'idle',
          label: 'Exclusive Range',
        },
      ];

      const mockT = vi.spyOn(i18n, 't').mockReturnValue('10 to 20');

      const result = formatHumanReadable({
        ...defaultFormatProps,
        manualRanges,
      });

      expect(getFieldValueCaption).not.toHaveBeenCalled();
      expect(mockT).toHaveBeenCalledWith('to', {
        start: 'formatted-123',
        end: 'formatted-123',
      });
      expect(result).toBe('10 to 20');

      mockT.mockRestore();
    });

    it('should handle multiple manual ranges and find the correct match', () => {
      const manualRanges: FacetValueRange[] = [
        {
          start: 5,
          end: 10,
          endInclusive: true,
          state: 'idle',
          label: 'Low Range',
        },
        {
          start: 10,
          end: 20,
          endInclusive: true,
          state: 'idle',
          label: 'Medium Range',
        },
        {
          start: 20,
          end: 50,
          endInclusive: true,
          state: 'idle',
          label: 'High Range',
        },
      ];

      vi.mocked(getFieldValueCaption).mockReturnValue('Medium Range Caption');

      const result = formatHumanReadable({
        ...defaultFormatProps,
        manualRanges,
      });

      expect(getFieldValueCaption).toHaveBeenCalledWith(
        'price',
        'Medium Range',
        i18n
      );
      expect(result).toBe('Medium Range Caption');
    });
  });

  describe('#formatNumberLocalized', () => {
    it('should successfully format a number using the provided formatter', () => {
      const result = formatNumberLocalized(
        123.45,
        i18n,
        mockLogger,
        mockFormatter
      );

      expect(mockFormatter).toHaveBeenCalledWith(123.45, i18n.languages);
      expect(result).toBe('formatted-123');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle integer values', () => {
      const result = formatNumberLocalized(
        100,
        i18n,
        mockLogger,
        mockFormatter
      );

      expect(mockFormatter).toHaveBeenCalledWith(100, i18n.languages);
      expect(result).toBe('formatted-123');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle zero values', () => {
      const result = formatNumberLocalized(0, i18n, mockLogger, mockFormatter);

      expect(mockFormatter).toHaveBeenCalledWith(0, i18n.languages);
      expect(result).toBe('formatted-123');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle negative values', () => {
      const result = formatNumberLocalized(
        -50.75,
        i18n,
        mockLogger,
        mockFormatter
      );

      expect(mockFormatter).toHaveBeenCalledWith(-50.75, i18n.languages);
      expect(result).toBe('formatted-123');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle formatter errors and return the original value', () => {
      const errorFormatter = vi.fn().mockImplementation(() => {
        throw new Error('Formatting failed');
      });

      const result = formatNumberLocalized(
        123.45,
        i18n,
        mockLogger,
        errorFormatter
      );

      expect(errorFormatter).toHaveBeenCalledWith(123.45, i18n.languages);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'atomic-numeric-facet facet value "123.45" could not be formatted correctly.',
        expect.any(Error)
      );
      expect(result).toBe(123.45);
    });

    it('should handle very large numbers', () => {
      const largeNumber = 999999999.99;
      const result = formatNumberLocalized(
        largeNumber,
        i18n,
        mockLogger,
        mockFormatter
      );

      expect(mockFormatter).toHaveBeenCalledWith(largeNumber, i18n.languages);
      expect(result).toBe('formatted-123');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle very small decimal numbers', () => {
      const smallNumber = 0.0001;
      const result = formatNumberLocalized(
        smallNumber,
        i18n,
        mockLogger,
        mockFormatter
      );

      expect(mockFormatter).toHaveBeenCalledWith(smallNumber, i18n.languages);
      expect(result).toBe('formatted-123');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle Infinity values', () => {
      const result = formatNumberLocalized(
        Infinity,
        i18n,
        mockLogger,
        mockFormatter
      );

      expect(mockFormatter).toHaveBeenCalledWith(Infinity, i18n.languages);
      expect(result).toBe('formatted-123');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should handle NaN values', () => {
      const result = formatNumberLocalized(
        NaN,
        i18n,
        mockLogger,
        mockFormatter
      );

      expect(mockFormatter).toHaveBeenCalledWith(NaN, i18n.languages);
      expect(result).toBe('formatted-123');
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should pass the correct languages array to formatter', () => {
      const mockLanguages = ['en', 'fr', 'de'];
      i18n.languages = mockLanguages;

      formatNumberLocalized(42, i18n, mockLogger, mockFormatter);

      expect(mockFormatter).toHaveBeenCalledWith(42, mockLanguages);
    });
  });

  describe('integration tests', () => {
    it('should format a complete range with real-world data', () => {
      const mockT = vi.spyOn(i18n, 't').mockReturnValue('$10.00 to $99.99');

      const realWorldFormatter: NumberFormatter = (value, languages) => {
        return new Intl.NumberFormat(languages, {
          style: 'currency',
          currency: 'USD',
        }).format(value);
      };

      const props: FormatFacetValueRange = {
        ...defaultFormatProps,
        facetValue: {
          start: 10.0,
          end: 99.99,
          endInclusive: true,
          state: 'selected',
          numberOfResults: 156,
        },
        formatter: realWorldFormatter,
      };

      const result = formatHumanReadable(props);

      expect(mockT).toHaveBeenCalledWith('to', {
        start: '$10.00',
        end: '$99.99',
      });
      expect(result).toBe('$10.00 to $99.99');

      mockT.mockRestore();
    });

    it('should handle complex manual range matching', () => {
      const complexManualRanges: FacetValueRange[] = [
        {
          start: 0,
          end: 25,
          endInclusive: false,
          state: 'idle',
          label: 'Budget',
        },
        {
          start: 25,
          end: 100,
          endInclusive: true,
          state: 'idle',
          label: 'Mid-range',
        },
        {
          start: 100,
          end: 500,
          endInclusive: true,
          state: 'idle',
          label: 'Premium',
        },
      ];

      vi.mocked(getFieldValueCaption).mockReturnValue('Mid-range Products');

      const props: FormatFacetValueRange = {
        ...defaultFormatProps,
        facetValue: {
          start: 25,
          end: 100,
          endInclusive: true,
          state: 'selected',
          numberOfResults: 89,
        },
        manualRanges: complexManualRanges,
      };

      const result = formatHumanReadable(props);

      expect(getFieldValueCaption).toHaveBeenCalledWith(
        'price',
        'Mid-range',
        i18n
      );
      expect(result).toBe('Mid-range Products');
    });
  });
});
