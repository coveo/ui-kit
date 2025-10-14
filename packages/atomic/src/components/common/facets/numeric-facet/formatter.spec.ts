import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import type {NumberFormatter} from '@/src/components/common/formats/format-common';
import {getFieldValueCaption} from '@/src/utils/field-utils';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  type FacetValueRange,
  type FormatFacetValueRange,
  formatHumanReadable,
  formatNumberLocalized,
} from './formatter';

vi.mock('@/src/utils/field-utils', {spy: true});

describe('formatter', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  let mockLogger: Pick<Console, 'error'>;
  let mockFormatter: NumberFormatter;
  let _mockedConsoleError: MockInstance;
  let defaultFormatProps: FormatFacetValueRange;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    _mockedConsoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    mockLogger = {error: vi.fn()};
    mockFormatter = vi.fn().mockImplementation((value) => `formatted-${value}`);

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
          start: 444,
          end: 555,
          endInclusive: true,
          state: 'idle',
          label: 'Expensive Range',
        },
      ];

      const result = formatHumanReadable({
        ...defaultFormatProps,
        manualRanges,
      });

      expect(result).toBe('formatted-10 to formatted-20');
    });

    it('should return formatted range when manual ranges array is empty', () => {
      const result = formatHumanReadable(defaultFormatProps);

      expect(result).toBe('formatted-10 to formatted-20');
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
    it('should pass the correct languages array to formatter', () => {
      const mockLanguages = ['en', 'fr', 'de'];
      i18n.languages = mockLanguages;

      formatNumberLocalized(42, i18n, mockLogger, mockFormatter);

      expect(mockFormatter).toHaveBeenCalledWith(42, mockLanguages);
    });
  });
});
