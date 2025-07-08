import {NumberFormatter} from '@/src/components/common/formats/format-common';
import {renderFunctionFixture} from '@/vitest-utils/testing-helpers/fixture';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {page} from '@vitest/browser/context';
import '@vitest/browser/matchers.d.ts';
import {html} from 'lit';
import {vi, expect, describe, beforeAll, beforeEach, it} from 'vitest';
import {renderFacetValueCheckbox} from '../facet-value-checkbox/facet-value-checkbox';
import {renderFacetValueLabelHighlight} from '../facet-value-label-highlight/facet-value-label-highlight';
import {renderFacetValueLink} from '../facet-value-link/facet-value-link';
import {formatHumanReadable} from './formatter';
import {
  renderNumericFacetValue,
  type NumericFacetValueLinkProps,
} from './value-link';

// Mock the dependencies
vi.mock('../facet-value-checkbox/facet-value-checkbox', {spy: true});
vi.mock('../facet-value-link/facet-value-link', {spy: true});
vi.mock('../facet-value-label-highlight/facet-value-label-highlight', {
  spy: true,
});
vi.mock('./formatter', {spy: true});

describe('#renderNumericFacetValue', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;
  let mockOnClick: ReturnType<typeof vi.fn>;
  let mockLogger: Pick<Console, 'error'>;
  let mockFormatter: NumberFormatter;
  let defaultProps: NumericFacetValueLinkProps;

  beforeAll(async () => {
    i18n = await createTestI18n();
  });

  beforeEach(() => {
    mockOnClick = vi.fn();
    mockLogger = {error: vi.fn()};
    mockFormatter = vi.fn().mockReturnValue('formatted number');

    defaultProps = {
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
      onClick: mockOnClick,
      displayValuesAs: 'checkbox',
    };

    vi.clearAllMocks();
    vi.mocked(formatHumanReadable).mockReturnValue('10 to 20');
  });

  const renderComponent = async (
    props: Partial<NumericFacetValueLinkProps> = {}
  ) => {
    const mergedProps = {...defaultProps, ...props};
    return await renderFunctionFixture(
      html`${renderNumericFacetValue({props: mergedProps})}`
    );
  };

  it('should call formatHumanReadable with correct props', async () => {
    await renderComponent({displayValuesAs: 'checkbox'});

    expect(formatHumanReadable).toHaveBeenCalledWith(
      expect.objectContaining({
        field: 'price',
        facetValue: defaultProps.facetValue,
        manualRanges: [],
        i18n,
        logger: mockLogger,
        formatter: mockFormatter,
      })
    );
  });

  describe('when displayValuesAs is "checkbox"', () => {
    it('should call renderFacetValueCheckbox with correct props when facet value is not selected', async () => {
      await renderComponent({
        displayValuesAs: 'checkbox',
        facetValue: {...defaultProps.facetValue, state: 'idle'},
      });

      expect(renderFacetValueCheckbox).toHaveBeenCalledWith({
        props: {
          displayValue: '10 to 20',
          numberOfResults: 42,
          isSelected: false,
          i18n,
          onClick: expect.any(Function),
        },
      });
    });

    it('should call renderFacetValueCheckbox with correct props when facet value is selected', async () => {
      await renderComponent({
        displayValuesAs: 'checkbox',
        facetValue: {...defaultProps.facetValue, state: 'selected'},
      });

      expect(renderFacetValueCheckbox).toHaveBeenCalledWith({
        props: {
          displayValue: '10 to 20',
          numberOfResults: 42,
          isSelected: true,
          i18n,
          onClick: expect.any(Function),
        },
      });
    });

    it('should call renderFacetValueLabelHighlight with correct props', async () => {
      await renderComponent({displayValuesAs: 'checkbox'});

      expect(renderFacetValueLabelHighlight).toHaveBeenCalledWith({
        props: {
          displayValue: '10 to 20',
          isSelected: false,
        },
      });
    });

    it('should call onClick when checkbox onClick is triggered', async () => {
      await renderComponent({displayValuesAs: 'checkbox'});

      const button = await page.getByRole('checkbox');
      await button.click();

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('when displayValuesAs is "link"', () => {
    it('should call renderFacetValueLink with correct props when facet value is not selected', async () => {
      await renderComponent({
        displayValuesAs: 'link',
        facetValue: {...defaultProps.facetValue, state: 'idle'},
      });

      expect(renderFacetValueLink).toHaveBeenCalledWith({
        props: {
          displayValue: '10 to 20',
          numberOfResults: 42,
          isSelected: false,
          i18n,
          onClick: mockOnClick,
        },
      });
    });

    it('should call renderFacetValueLink with correct props when facet value is selected', async () => {
      await renderComponent({
        displayValuesAs: 'link',
        facetValue: {...defaultProps.facetValue, state: 'selected'},
      });

      expect(renderFacetValueLink).toHaveBeenCalledWith({
        props: {
          displayValue: '10 to 20',
          numberOfResults: 42,
          isSelected: true,
          i18n,
          onClick: mockOnClick,
        },
      });
    });

    it('should call renderFacetValueLabelHighlight with correct props for link', async () => {
      await renderComponent({displayValuesAs: 'link'});

      expect(renderFacetValueLabelHighlight).toHaveBeenCalledWith({
        props: {
          displayValue: '10 to 20',
          isSelected: false,
        },
      });
    });
  });

  it('should return nothing when displayValuesAs is invalid', async () => {
    const element = await renderComponent({
      displayValuesAs: 'invalid' as 'checkbox' | 'link',
    });

    // The element should be empty when nothing is returned
    expect(element.children).toHaveLength(0);
  });

  it('should pass manual ranges to formatHumanReadable', async () => {
    const manualRanges = [
      {
        start: 10,
        end: 20,
        endInclusive: true,
        label: 'Budget Range',
        state: 'idle' as const,
      },
    ];

    await renderComponent({
      manualRanges,
      displayValuesAs: 'checkbox',
    });

    expect(formatHumanReadable).toHaveBeenCalledWith(
      expect.objectContaining({
        manualRanges,
      })
    );
  });
});
